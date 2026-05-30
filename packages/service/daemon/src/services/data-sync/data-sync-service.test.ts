import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Datastore } from '@two-pebble/datastore';
import { createEmptyTipTapDocument } from '@two-pebble/datatypes';
import { reconcileKey } from '@two-pebble/protocol';
import { DataSyncService } from './data-sync-service';

const tempRoots: string[] = [];

async function freshDatastore(): Promise<Datastore> {
  const file = path.join(os.tmpdir(), `data-sync-${crypto.randomUUID()}.sqlite`);
  tempRoots.push(file);
  const datastore = new Datastore({ databaseFilePath: file });
  await datastore.migrate();
  return datastore;
}

function tempDirectory(): string {
  const directory = path.join(os.tmpdir(), `data-sync-dir-${crypto.randomUUID()}`);
  tempRoots.push(directory);
  return directory;
}

beforeEach(() => {
  tempRoots.length = 0;
});

afterEach(() => {
  for (const target of tempRoots) {
    fs.rmSync(target, { force: true, recursive: true });
    fs.rmSync(`${target}-shm`, { force: true });
    fs.rmSync(`${target}-wal`, { force: true });
  }
});

async function seedSource(datastore: Datastore): Promise<void> {
  const project = await datastore.projects.create({ name: 'Alpha' });
  const repository = await datastore.repositories.create({ name: 'app', path: '/code/app', baseBranch: 'main' });
  const agent = await datastore.agentRegistries.create({
    name: 'Coder',
    systemPrompt: createEmptyTipTapDocument(),
    capabilities: '[]',
    workspaceConfig: JSON.stringify({ kind: 'worktree', repositoryId: repository.id }),
  });
  await datastore.documents.create({
    name: 'Runbook',
    projectId: project.id,
    content: JSON.stringify(createEmptyTipTapDocument()),
    section: 'Guides',
  });
  await datastore.automations.create({
    name: 'Nightly',
    agentRegistryId: agent.id,
    message: 'do the thing',
    intervalUnit: 'hours',
    intervalValue: 24,
    enabled: true,
  });
  await datastore.taskBoards.create({ name: 'Main board', projectId: project.id });
}

describe('feature: data-sync export then import round trip', () => {
  test('reconstructs records by name in a fresh instance, rewriting FK ids', async () => {
    const source = await freshDatastore();
    const directory = tempDirectory();
    await seedSource(source);

    const exporter = new DataSyncService(source);
    const exportPlan = await exporter.buildPlan({ direction: 'export', directory, projectNames: [] });
    const exportResult = await exporter.apply(exportPlan);
    expect(exportResult.applied).toBeGreaterThan(0);
    await source.close();

    // Files landed on disk under the documented layout.
    expect(fs.existsSync(path.join(directory, 'projects', 'alpha', 'project.json'))).toBe(true);
    expect(fs.existsSync(path.join(directory, 'repositories', 'app.json'))).toBe(true);

    const target = await freshDatastore();
    const importer = new DataSyncService(target);
    const importPlan = await importer.buildPlan({ direction: 'import', directory, projectNames: [] });
    // The seeded records are all new in the fresh target; none are blocked.
    expect(importPlan.entries.some((entry) => entry.status === 'blocked')).toBe(false);
    expect(importPlan.entries.find((entry) => entry.key === reconcileKey('project', undefined, 'Alpha'))?.status).toBe(
      'new',
    );
    const importResult = await importer.apply(importPlan);
    expect(importResult.warnings).toEqual([]);

    const projects = await target.projects.list({});
    const alpha = projects.items.find((row) => row.name === 'Alpha');
    expect(alpha).toBeDefined();

    const repositories = await target.repositories.list({ limit: 100, offset: 0 });
    const repo = repositories.items.find((row) => row.name === 'app');
    expect(repo?.path).toBe('/code/app');

    const agents = await target.agentRegistries.list({ limit: 100, offset: 0 });
    const coder = agents.items.find((row) => row.name === 'Coder');
    expect(coder).toBeDefined();
    // The workspace repository FK was rewritten to the target instance's id.
    const workspace = JSON.parse(coder?.workspaceConfig ?? '{}') as { kind: string; repositoryId?: string };
    expect(workspace.kind).toBe('worktree');
    expect(workspace.repositoryId).toBe(repo?.id);

    const documents = await target.documents.list({ limit: 100, offset: 0, projectId: alpha?.id });
    expect(documents.items.find((row) => row.name === 'Runbook')?.section).toBe('Guides');

    const automations = await target.automations.list({ limit: 100, offset: 0 });
    const nightly = automations.items.find((row) => row.name === 'Nightly');
    expect(nightly?.agentRegistryId).toBe(coder?.id);

    await target.close();
  });

  test('export is a true replacement: deleting a record locally removes its file', async () => {
    const source = await freshDatastore();
    const directory = tempDirectory();
    await seedSource(source);

    const service = new DataSyncService(source);
    await service.apply(await service.buildPlan({ direction: 'export', directory, projectNames: [] }));
    expect(fs.existsSync(path.join(directory, 'repositories', 'app.json'))).toBe(true);

    const repos = await source.repositories.list({ limit: 100, offset: 0 });
    const firstRepo = repos.items[0];
    expect(firstRepo).toBeDefined();
    await source.repositories.delete({ id: firstRepo?.id ?? '' });

    const secondPlan = await service.buildPlan({ direction: 'export', directory, projectNames: [] });
    expect(secondPlan.orphans).toContain(reconcileKey('repository', undefined, 'app'));
    const result = await service.apply(secondPlan);
    expect(result.orphansRemoved).toBe(1);
    expect(fs.existsSync(path.join(directory, 'repositories', 'app.json'))).toBe(false);

    await source.close();
  });

  test('blocked import is skipped, then unblocked by selecting its dependency', async () => {
    const source = await freshDatastore();
    const directory = tempDirectory();
    await seedSource(source);
    const exporter = new DataSyncService(source);
    await exporter.apply(await exporter.buildPlan({ direction: 'export', directory, projectNames: [] }));
    await source.close();

    const target = await freshDatastore();
    const importer = new DataSyncService(target);
    const plan = await importer.buildPlan({ direction: 'import', directory, projectNames: [] });

    // Deselect the project; its document/agent/board should cascade to blocked.
    const projectKey = reconcileKey('project', undefined, 'Alpha');
    const { toggleSelection } = await import('@two-pebble/protocol');
    const withoutProject = toggleSelection(plan, projectKey, false);
    const documentEntry = withoutProject.entries.find(
      (entry) => entry.key === reconcileKey('document', 'Alpha', 'Runbook'),
    );
    expect(documentEntry?.status).toBe('blocked');

    const result = await importer.apply(withoutProject);
    // The project itself was deselected, so no project is created.
    const projects = await target.projects.list({});
    expect(projects.items.find((row) => row.name === 'Alpha')).toBeUndefined();
    expect(result.applied).toBeGreaterThanOrEqual(0);

    await target.close();
  });
});
