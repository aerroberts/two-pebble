import type { AutomationIntervalUnit } from '@two-pebble/datastore';
import type { TipTapDocument, WorkspaceConfig } from '@two-pebble/datatypes';
import type { DependencyRef, DiskRecord, SyncEntityType } from '@two-pebble/protocol';
import { reconcileKey } from '@two-pebble/protocol';

/**
 * The single serializer registry. Each entry declares how one synced entity
 * maps between a datastore row and a `DiskRecord` (ids ⇄ names, whitelisted
 * fields) and what dependencies its `fields` imply. The reconciler derives the
 * cascade purely from `dependencies`; the service uses `serialize`/`deserialize`
 * to cross the disk boundary. Nested blobs (systemPrompt, workspaceConfig,
 * document content) are carried opaquely with FK ids already rewritten to names.
 */

/** Key for an ambient (non-synced) reference such as an inference profile. */
export function ambientKey(entityType: string, name: string): string {
  return `${entityType}:*:${name}`;
}

/** Name lookups available while serializing local rows to disk records. */
export interface SerializeContext {
  projectNameById: Map<string, string>;
  repositoryNameById: Map<string, string>;
  agentRegistryNameById: Map<string, string>;
  agentRegistryProjectIdById: Map<string, string>;
  inferenceProfileNameById: Map<string, string>;
  thirdPartyInstallNameById: Map<string, string>;
  taskTemplateNameById: Map<string, string>;
  warnings: string[];
}

/** Id lookups available while turning disk records back into datastore inputs. */
export interface DeserializeContext {
  repositoryIdByName: Map<string, string>;
  inferenceProfileIdByName: Map<string, string>;
  thirdPartyInstallIdByName: Map<string, string>;
}

/** A serialized record minus the version/contentHash the service stamps on. */
export interface SerializedRecord {
  entityType: SyncEntityType;
  name: string;
  projectName?: string;
  fields: Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function rewriteWorkspaceConfigToNames(
  raw: string,
  ctx: SerializeContext,
): { config: Record<string, unknown>; repositoryName: string | null } {
  const parsed = JSON.parse(raw) as WorkspaceConfig;
  if (parsed.kind === 'worktree') {
    const repositoryName = ctx.repositoryNameById.get(parsed.repositoryId) ?? null;
    if (repositoryName === null) {
      ctx.warnings.push(
        `Agent references a repository that no longer exists; its workspace will not resolve on import.`,
      );
    }
    const { repositoryId: _omit, ...rest } = parsed;
    return { config: { ...rest, repositoryName }, repositoryName };
  }
  return { config: parsed as unknown as Record<string, unknown>, repositoryName: null };
}

function rewriteWorkspaceConfigToIds(config: Record<string, unknown>, ctx: DeserializeContext): string {
  if (config.kind === 'worktree') {
    const repositoryName = asString(config.repositoryName);
    const repositoryId = repositoryName === null ? undefined : ctx.repositoryIdByName.get(repositoryName);
    const { repositoryName: _omit, ...rest } = config;
    return JSON.stringify({ ...rest, repositoryId: repositoryId ?? '' });
  }
  return JSON.stringify(config);
}

// --- Row shapes the serializers consume (subset of datastore records). ---

interface ProjectRowLike {
  name: string;
}
interface RepositoryRowLike {
  name: string;
  path: string;
  baseBranch: string;
}
interface AgentRegistryRowLike {
  name: string;
  projectId: string;
  kind: string;
  systemPrompt: TipTapDocument;
  capabilities: string;
  workspaceConfig: string;
  inferenceProfileId: string | null;
  thirdPartyAgentInstallId: string | null;
}
interface DocumentRowLike {
  name: string;
  projectId: string;
  section: string | null;
  references: string;
  content: string;
}
interface BoardRowLike {
  name: string;
  projectId: string;
  defaultTemplateId: string | null;
}
interface AutomationRowLike {
  name: string;
  agentRegistryId: string;
  message: string;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
  enabled: boolean;
}

/** Datastore inputs produced by deserialize, ready for create/update. */
export interface DeserializedRecord {
  name: string;
  projectName?: string;
  input: Record<string, unknown>;
}

export interface SyncSerializer {
  entityType: SyncEntityType;
  projectScoped: boolean;
  serialize(row: unknown, ctx: SerializeContext): SerializedRecord | null;
  deserialize(record: DiskRecord, ctx: DeserializeContext): DeserializedRecord;
  dependencies(record: DiskRecord): DependencyRef[];
}

const projectSerializer: SyncSerializer = {
  entityType: 'project',
  projectScoped: false,
  serialize(row) {
    const project = row as ProjectRowLike;
    return { entityType: 'project', name: project.name, fields: {} };
  },
  deserialize(record) {
    return { name: record.name, input: { name: record.name } };
  },
  dependencies() {
    return [];
  },
};

const repositorySerializer: SyncSerializer = {
  entityType: 'repository',
  projectScoped: false,
  serialize(row) {
    const repository = row as RepositoryRowLike;
    return {
      entityType: 'repository',
      name: repository.name,
      fields: { path: repository.path, baseBranch: repository.baseBranch },
    };
  },
  deserialize(record) {
    return {
      name: record.name,
      input: {
        name: record.name,
        path: asString(record.fields.path) ?? '',
        baseBranch: asString(record.fields.baseBranch) ?? '',
      },
    };
  },
  dependencies() {
    return [];
  },
};

const agentRegistrySerializer: SyncSerializer = {
  entityType: 'agentRegistry',
  projectScoped: true,
  serialize(row, ctx) {
    const registry = row as AgentRegistryRowLike;
    const projectName = ctx.projectNameById.get(registry.projectId);
    if (projectName === undefined) {
      ctx.warnings.push(`Agent "${registry.name}" has no project and was skipped.`);
      return null;
    }
    const { config } = rewriteWorkspaceConfigToNames(registry.workspaceConfig, ctx);
    const inferenceProfileName =
      registry.inferenceProfileId === null
        ? null
        : (ctx.inferenceProfileNameById.get(registry.inferenceProfileId) ?? null);
    const thirdPartyAgentInstallName =
      registry.thirdPartyAgentInstallId === null
        ? null
        : (ctx.thirdPartyInstallNameById.get(registry.thirdPartyAgentInstallId) ?? null);
    return {
      entityType: 'agentRegistry',
      name: registry.name,
      projectName,
      fields: {
        kind: registry.kind,
        systemPrompt: registry.systemPrompt,
        capabilities: JSON.parse(registry.capabilities),
        workspaceConfig: config,
        inferenceProfileName,
        thirdPartyAgentInstallName,
      },
    };
  },
  deserialize(record, ctx) {
    const config = (record.fields.workspaceConfig ?? { kind: 'cwd' }) as Record<string, unknown>;
    const inferenceProfileName = asString(record.fields.inferenceProfileName);
    const thirdPartyAgentInstallName = asString(record.fields.thirdPartyAgentInstallName);
    return {
      name: record.name,
      projectName: record.projectName,
      input: {
        name: record.name,
        systemPrompt: record.fields.systemPrompt as TipTapDocument,
        capabilities: JSON.stringify(record.fields.capabilities ?? []),
        workspaceConfig: rewriteWorkspaceConfigToIds(config, ctx),
        inferenceProfileId:
          inferenceProfileName === null ? null : (ctx.inferenceProfileIdByName.get(inferenceProfileName) ?? null),
        thirdPartyAgentInstallId:
          thirdPartyAgentInstallName === null
            ? null
            : (ctx.thirdPartyInstallIdByName.get(thirdPartyAgentInstallName) ?? null),
      },
    };
  },
  dependencies(record) {
    const refs: DependencyRef[] = [];
    if (record.projectName !== undefined) {
      refs.push({
        key: reconcileKey('project', undefined, record.projectName),
        entityType: 'project',
        name: record.projectName,
        syncable: true,
      });
    }
    const config = record.fields.workspaceConfig as Record<string, unknown> | undefined;
    const repositoryName = config === undefined ? null : asString(config.repositoryName);
    if (repositoryName !== null) {
      refs.push({
        key: reconcileKey('repository', undefined, repositoryName),
        entityType: 'repository',
        name: repositoryName,
        syncable: true,
      });
    }
    const inferenceProfileName = asString(record.fields.inferenceProfileName);
    if (inferenceProfileName !== null) {
      refs.push({
        key: ambientKey('inferenceProfile', inferenceProfileName),
        entityType: 'inferenceProfile',
        name: inferenceProfileName,
        syncable: false,
      });
    }
    const thirdPartyAgentInstallName = asString(record.fields.thirdPartyAgentInstallName);
    if (thirdPartyAgentInstallName !== null) {
      refs.push({
        key: ambientKey('thirdPartyInstall', thirdPartyAgentInstallName),
        entityType: 'thirdPartyInstall',
        name: thirdPartyAgentInstallName,
        syncable: false,
      });
    }
    return refs;
  },
};

const documentSerializer: SyncSerializer = {
  entityType: 'document',
  projectScoped: true,
  serialize(row, ctx) {
    const document = row as DocumentRowLike;
    const projectName = ctx.projectNameById.get(document.projectId);
    if (projectName === undefined) {
      ctx.warnings.push(`Document "${document.name}" has no project and was skipped.`);
      return null;
    }
    return {
      entityType: 'document',
      name: document.name,
      projectName,
      fields: {
        section: document.section,
        references: JSON.parse(document.references),
        content: JSON.parse(document.content),
      },
    };
  },
  deserialize(record) {
    return {
      name: record.name,
      projectName: record.projectName,
      input: {
        name: record.name,
        section: record.fields.section ?? null,
        references: JSON.stringify(record.fields.references ?? []),
        content: JSON.stringify(record.fields.content ?? { type: 'doc', content: [] }),
      },
    };
  },
  dependencies(record) {
    if (record.projectName === undefined) {
      return [];
    }
    return [
      {
        key: reconcileKey('project', undefined, record.projectName),
        entityType: 'project',
        name: record.projectName,
        syncable: true,
      },
    ];
  },
};

const boardSerializer: SyncSerializer = {
  entityType: 'board',
  projectScoped: true,
  serialize(row, ctx) {
    const board = row as BoardRowLike;
    const projectName = ctx.projectNameById.get(board.projectId);
    if (projectName === undefined) {
      ctx.warnings.push(`Board "${board.name}" has no project and was skipped.`);
      return null;
    }
    const defaultTemplateName =
      board.defaultTemplateId === null ? null : (ctx.taskTemplateNameById.get(board.defaultTemplateId) ?? null);
    return {
      entityType: 'board',
      name: board.name,
      projectName,
      fields: { defaultTemplateName },
    };
  },
  deserialize(record) {
    // defaultTemplate is a best-effort pointer resolved during apply (templates
    // are not themselves synced), so it is not part of the create input here.
    return { name: record.name, projectName: record.projectName, input: { name: record.name } };
  },
  dependencies(record) {
    if (record.projectName === undefined) {
      return [];
    }
    return [
      {
        key: reconcileKey('project', undefined, record.projectName),
        entityType: 'project',
        name: record.projectName,
        syncable: true,
      },
    ];
  },
};

const automationSerializer: SyncSerializer = {
  entityType: 'automation',
  projectScoped: true,
  serialize(row, ctx) {
    const automation = row as AutomationRowLike;
    const agentRegistryName = ctx.agentRegistryNameById.get(automation.agentRegistryId);
    const registryProjectId = ctx.agentRegistryProjectIdById.get(automation.agentRegistryId);
    const projectName = registryProjectId === undefined ? undefined : ctx.projectNameById.get(registryProjectId);
    if (agentRegistryName === undefined || projectName === undefined) {
      ctx.warnings.push(`Automation "${automation.name}" references a missing agent and was skipped.`);
      return null;
    }
    return {
      entityType: 'automation',
      name: automation.name,
      projectName,
      fields: {
        message: automation.message,
        intervalUnit: automation.intervalUnit,
        intervalValue: automation.intervalValue,
        enabled: automation.enabled,
        agentRegistryName,
      },
    };
  },
  deserialize(record) {
    return {
      name: record.name,
      projectName: record.projectName,
      input: {
        name: record.name,
        message: asString(record.fields.message) ?? '',
        intervalUnit: record.fields.intervalUnit,
        intervalValue: record.fields.intervalValue,
        enabled: record.fields.enabled === true,
        agentRegistryName: asString(record.fields.agentRegistryName),
      },
    };
  },
  dependencies(record) {
    const agentRegistryName = asString(record.fields.agentRegistryName);
    if (record.projectName === undefined || agentRegistryName === null) {
      return [];
    }
    return [
      {
        key: reconcileKey('agentRegistry', record.projectName, agentRegistryName),
        entityType: 'agentRegistry',
        name: agentRegistryName,
        syncable: true,
      },
    ];
  },
};

/** Apply/disk-write order. The FK graph is acyclic, so fixed passes suffice. */
export const SYNC_ENTITY_ORDER: SyncEntityType[] = [
  'project',
  'repository',
  'agentRegistry',
  'board',
  'document',
  'automation',
];

export const SERIALIZERS: Record<SyncEntityType, SyncSerializer> = {
  project: projectSerializer,
  repository: repositorySerializer,
  agentRegistry: agentRegistrySerializer,
  document: documentSerializer,
  board: boardSerializer,
  automation: automationSerializer,
};

/** Pure dependency derivation used by the reconciler. */
export function dependenciesOf(record: DiskRecord): DependencyRef[] {
  return SERIALIZERS[record.entityType].dependencies(record);
}
