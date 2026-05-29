import type { Datastore } from '@two-pebble/datastore';
import type { DiskRecord, ReconcilePlan, SyncDirection, SyncEntityType } from '@two-pebble/protocol';
import { actionableEntries } from '@two-pebble/protocol';
import { contentHashOf } from './canonical-json';
import { DiskRepository } from './disk-repository';
import { reconcile } from './reconciler';
import {
  ambientKey,
  type DeserializeContext,
  dependenciesOf,
  SERIALIZERS,
  type SerializeContext,
  SYNC_ENTITY_ORDER,
} from './serializers';
import type { ApplyResult } from './types';

const LIST_LIMIT = 100_000;

/**
 * Orchestrates export/import. Reads both sides, runs the pure reconciler, and
 * applies a reviewed plan. The datastore reads/writes flow through existing
 * operations; the disk side flows through `DiskRepository`; the diff/cascade is
 * the pure reconciler. This class holds no state between build and apply.
 */
export class DataSyncService {
  private readonly datastore: Datastore;
  private readonly disk: DiskRepository;

  public constructor(datastore: Datastore, disk: DiskRepository = new DiskRepository()) {
    this.datastore = datastore;
    this.disk = disk;
  }

  public async buildPlan(input: {
    direction: SyncDirection;
    directory: string;
    projectNames: string[];
  }): Promise<ReconcilePlan> {
    const local = await this.serializeLocal();
    const diskResult = this.disk.readAll(input.directory);
    const ambientKeys = await this.ambientDestinationKeys();
    const projects = await this.datastore.projects.list({});
    const allProjectNames = projects.items.map((project) => project.name);
    const scope = { projectNames: input.projectNames.length > 0 ? input.projectNames : allProjectNames };

    return reconcile({
      direction: input.direction,
      directory: input.directory,
      scope,
      local: local.records,
      disk: diskResult.records,
      ambientKeys,
      dependenciesOf,
      warnings: [...local.warnings, ...diskResult.warnings],
    });
  }

  public async apply(plan: ReconcilePlan): Promise<ApplyResult> {
    return plan.direction === 'export' ? this.applyExport(plan) : this.applyImport(plan);
  }

  private applyExport(plan: ReconcilePlan): ApplyResult {
    this.disk.ensureDirectory(plan.directory);
    const actionable = actionableEntries(plan);
    const warnings = [...plan.warnings];
    let applied = 0;

    for (const type of SYNC_ENTITY_ORDER) {
      for (const entry of actionable.filter((candidate) => candidate.entityType === type)) {
        if (entry.local === undefined) {
          continue;
        }
        try {
          this.disk.write(plan.directory, entry.local);
          applied += 1;
        } catch (error) {
          warnings.push(`Could not write ${entry.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    const orphan = this.disk.removeOrphans(plan.directory, plan.orphans);
    warnings.push(...orphan.warnings);
    return { applied, skipped: actionable.length - applied, orphansRemoved: orphan.removed, warnings };
  }

  private async applyImport(plan: ReconcilePlan): Promise<ApplyResult> {
    const context = await this.buildDeserializeContext();
    const projectIdByName = await this.projectIdByName();
    const agentRegistryIdByKey = await this.agentRegistryIdByKey();
    const taskTemplateIdByName = await this.taskTemplateIdByName();

    const actionable = actionableEntries(plan);
    const warnings = [...plan.warnings];
    let applied = 0;
    let skipped = 0;

    for (const type of SYNC_ENTITY_ORDER) {
      for (const entry of actionable.filter((candidate) => candidate.entityType === type)) {
        const record = entry.disk;
        if (record === undefined) {
          skipped += 1;
          continue;
        }
        const serializer = SERIALIZERS[type];
        const deserialized = serializer.deserialize(record, context);
        const projectId =
          deserialized.projectName === undefined ? undefined : projectIdByName.get(deserialized.projectName);
        if (serializer.projectScoped && projectId === undefined) {
          warnings.push(`Skipped ${type} "${deserialized.name}": project not found.`);
          skipped += 1;
          continue;
        }
        try {
          const id = await this.upsert(type, record, deserialized.input, projectId, {
            projectName: deserialized.projectName,
            agentRegistryIdByKey,
            taskTemplateIdByName,
          });
          if (type === 'project') {
            projectIdByName.set(deserialized.name, id);
          } else if (type === 'agentRegistry') {
            agentRegistryIdByKey.set(deserialized.name, id);
          } else if (type === 'repository') {
            context.repositoryIdByName.set(deserialized.name, id);
          }
          applied += 1;
        } catch (error) {
          warnings.push(
            `Failed to import ${type} "${record.name}": ${error instanceof Error ? error.message : String(error)}`,
          );
          skipped += 1;
        }
      }
    }

    return { applied, skipped, orphansRemoved: 0, warnings };
  }

  private async upsert(
    type: SyncEntityType,
    record: DiskRecord,
    input: Record<string, unknown>,
    projectId: string | undefined,
    resolvers: {
      projectName?: string;
      agentRegistryIdByKey: Map<string, string>;
      taskTemplateIdByName: Map<string, string>;
    },
  ): Promise<string> {
    switch (type) {
      case 'project': {
        const existing = (await this.datastore.projects.list({})).items.find((row) => row.name === record.name);
        if (existing !== undefined) {
          return existing.id;
        }
        const created = await this.datastore.projects.create({ name: record.name });
        return created.id;
      }
      case 'repository': {
        const all = await this.datastore.repositories.list({ limit: LIST_LIMIT, offset: 0 });
        const existing = all.items.find((row) => row.name === record.name);
        const values = {
          name: record.name,
          path: String(input.path ?? ''),
          baseBranch: String(input.baseBranch ?? ''),
        };
        if (existing !== undefined) {
          await this.datastore.repositories.update({ id: existing.id, ...values });
          return existing.id;
        }
        const created = await this.datastore.repositories.create(values);
        return created.id;
      }
      case 'agentRegistry': {
        const all = await this.datastore.agentRegistries.list({ limit: LIST_LIMIT, offset: 0 });
        const existing = all.items.find((row) => row.name === record.name);
        const values = {
          name: record.name,
          systemPrompt: input.systemPrompt as never,
          capabilities: String(input.capabilities ?? '[]'),
          workspaceConfig: String(input.workspaceConfig ?? '{"kind":"cwd"}'),
          inferenceProfileId: (input.inferenceProfileId as string | null) ?? null,
          thirdPartyAgentInstallId: (input.thirdPartyAgentInstallId as string | null) ?? null,
        };
        if (existing !== undefined) {
          await this.datastore.agentRegistries.update({ id: existing.id, ...values });
          return existing.id;
        }
        const created = await this.datastore.agentRegistries.create(values);
        return created.id;
      }
      case 'document': {
        if (projectId === undefined) {
          throw new Error('project id required');
        }
        const all = await this.datastore.documents.list({ limit: LIST_LIMIT, offset: 0, projectId });
        const existing = all.items.find((row) => row.name === record.name);
        const values = {
          name: record.name,
          section: (input.section as string | null) ?? null,
          references: String(input.references ?? '[]'),
          content: String(input.content ?? '{"type":"doc","content":[]}'),
        };
        if (existing !== undefined) {
          await this.datastore.documents.update({ id: existing.id, ...values });
          return existing.id;
        }
        const created = await this.datastore.documents.create({ ...values, projectId });
        return created.id;
      }
      case 'board': {
        if (projectId === undefined) {
          throw new Error('project id required');
        }
        const all = await this.datastore.taskBoards.list({ projectId });
        const existing = all.items.find((row) => row.name === record.name);
        const boardId = existing?.id ?? (await this.datastore.taskBoards.create({ name: record.name, projectId })).id;
        const defaultTemplateName =
          typeof record.fields.defaultTemplateName === 'string' ? record.fields.defaultTemplateName : null;
        const defaultTemplateId =
          defaultTemplateName === null ? null : (resolvers.taskTemplateIdByName.get(defaultTemplateName) ?? null);
        if (defaultTemplateId !== null) {
          await this.datastore.taskBoards.update({ id: boardId, defaultTemplateId });
        }
        return boardId;
      }
      case 'automation': {
        const agentRegistryName = typeof input.agentRegistryName === 'string' ? input.agentRegistryName : null;
        const agentRegistryId =
          agentRegistryName === null ? undefined : resolvers.agentRegistryIdByKey.get(agentRegistryName);
        if (agentRegistryId === undefined) {
          throw new Error('referenced agent not found');
        }
        const all = await this.datastore.automations.list({ limit: LIST_LIMIT, offset: 0 });
        const existing = all.items.find((row) => row.name === record.name);
        const values = {
          name: record.name,
          message: String(input.message ?? ''),
          intervalUnit: input.intervalUnit as never,
          intervalValue: Number(input.intervalValue ?? 0),
          enabled: input.enabled === true,
          agentRegistryId,
        };
        if (existing !== undefined) {
          await this.datastore.automations.update({ id: existing.id, ...values });
          return existing.id;
        }
        const created = await this.datastore.automations.create(values);
        return created.id;
      }
      default: {
        throw new Error(`Unknown sync entity type: ${type}`);
      }
    }
  }

  /** Serializes every local record across all projects into disk records. */
  private async serializeLocal(): Promise<{ records: DiskRecord[]; warnings: string[] }> {
    const context = await this.buildSerializeContext();
    const records: DiskRecord[] = [];

    const push = (type: SyncEntityType, rows: unknown[]) => {
      for (const row of rows) {
        const serialized = SERIALIZERS[type].serialize(row, context);
        if (serialized === null) {
          continue;
        }
        records.push({
          version: 1,
          entityType: serialized.entityType,
          name: serialized.name,
          ...(serialized.projectName === undefined ? {} : { projectName: serialized.projectName }),
          fields: serialized.fields,
          contentHash: contentHashOf(serialized.fields),
        });
      }
    };

    const projects = await this.datastore.projects.list({});
    push('project', projects.items);
    const repositories = await this.datastore.repositories.list({ limit: LIST_LIMIT, offset: 0 });
    push('repository', repositories.items);
    const agentRegistries = await this.datastore.agentRegistries.list({ limit: LIST_LIMIT, offset: 0 });
    push('agentRegistry', agentRegistries.items);
    const documents = await this.datastore.documents.list({ limit: LIST_LIMIT, offset: 0 });
    push('document', documents.items);
    const boards = await this.datastore.taskBoards.list({});
    push('board', boards.items);
    const automations = await this.datastore.automations.list({ limit: LIST_LIMIT, offset: 0 });
    push('automation', automations.items);

    return { records, warnings: context.warnings };
  }

  private async buildSerializeContext(): Promise<SerializeContext> {
    const projects = await this.datastore.projects.list({});
    const repositories = await this.datastore.repositories.list({ limit: LIST_LIMIT, offset: 0 });
    const agentRegistries = await this.datastore.agentRegistries.list({ limit: LIST_LIMIT, offset: 0 });
    const inferenceProfiles = await this.datastore.inferenceProfiles.list({ limit: LIST_LIMIT, offset: 0 });
    const installs = await this.datastore.thirdPartyAgentInstalls.list({ limit: LIST_LIMIT, offset: 0 });

    return {
      projectNameById: new Map(projects.items.map((row) => [row.id, row.name])),
      repositoryNameById: new Map(repositories.items.map((row) => [row.id, row.name])),
      agentRegistryNameById: new Map(agentRegistries.items.map((row) => [row.id, row.name])),
      inferenceProfileNameById: new Map(inferenceProfiles.items.map((row) => [row.id, row.name])),
      thirdPartyInstallNameById: new Map(installs.items.map((row) => [row.id, row.name])),
      taskTemplateNameById: await this.taskTemplateNameById(),
      warnings: [],
    };
  }

  private async buildDeserializeContext(): Promise<DeserializeContext> {
    const repositories = await this.datastore.repositories.list({ limit: LIST_LIMIT, offset: 0 });
    const inferenceProfiles = await this.datastore.inferenceProfiles.list({ limit: LIST_LIMIT, offset: 0 });
    const installs = await this.datastore.thirdPartyAgentInstalls.list({ limit: LIST_LIMIT, offset: 0 });
    return {
      repositoryIdByName: new Map(repositories.items.map((row) => [row.name, row.id])),
      inferenceProfileIdByName: new Map(inferenceProfiles.items.map((row) => [row.name, row.id])),
      thirdPartyInstallIdByName: new Map(installs.items.map((row) => [row.name, row.id])),
    };
  }

  private async ambientDestinationKeys(): Promise<string[]> {
    const inferenceProfiles = await this.datastore.inferenceProfiles.list({ limit: LIST_LIMIT, offset: 0 });
    const installs = await this.datastore.thirdPartyAgentInstalls.list({ limit: LIST_LIMIT, offset: 0 });
    return [
      ...inferenceProfiles.items.map((row) => ambientKey('inferenceProfile', row.name)),
      ...installs.items.map((row) => ambientKey('thirdPartyInstall', row.name)),
    ];
  }

  private async projectIdByName(): Promise<Map<string, string>> {
    const projects = await this.datastore.projects.list({});
    return new Map(projects.items.map((row) => [row.name, row.id]));
  }

  private async agentRegistryIdByKey(): Promise<Map<string, string>> {
    const registries = await this.datastore.agentRegistries.list({ limit: LIST_LIMIT, offset: 0 });
    const map = new Map<string, string>();
    for (const registry of registries.items) {
      map.set(registry.name, registry.id);
    }
    return map;
  }

  private async taskTemplateNameById(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const boards = await this.datastore.taskBoards.list({});
    for (const board of boards.items) {
      const templates = await this.datastore.taskBoards.templates.list({ boardId: board.id });
      for (const template of templates.items) {
        map.set(template.id, template.name);
      }
    }
    return map;
  }

  private async taskTemplateIdByName(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const boards = await this.datastore.taskBoards.list({});
    for (const board of boards.items) {
      const templates = await this.datastore.taskBoards.templates.list({ boardId: board.id });
      for (const template of templates.items) {
        map.set(template.name, template.id);
      }
    }
    return map;
  }
}
