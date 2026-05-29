import { describe, expect, test } from 'bun:test';
import type { DependencyRef, DiskRecord, SyncEntityType } from '@two-pebble/protocol';
import { reconcileKey, toggleSelection } from '@two-pebble/protocol';
import { reconcile } from './reconciler';

function record(
  entityType: SyncEntityType,
  name: string,
  options: { projectName?: string; hash?: string; deps?: DependencyRef[] } = {},
): DiskRecord {
  return {
    version: 1,
    entityType,
    name,
    ...(options.projectName === undefined ? {} : { projectName: options.projectName }),
    fields: { deps: options.deps ?? [] },
    contentHash: options.hash ?? `${entityType}:${name}`,
  };
}

const depsFromFields = (input: DiskRecord): DependencyRef[] => (input.fields.deps as DependencyRef[]) ?? [];

function entryByKey(plan: ReturnType<typeof reconcile>, key: string) {
  const entry = plan.entries.find((candidate) => candidate.key === key);
  if (entry === undefined) {
    throw new Error(`missing entry ${key}`);
  }
  return entry;
}

describe('feature: reconcile diff status', () => {
  test('new/changed/unchanged are classified against the destination', () => {
    const local = [
      record('repository', 'fresh', { hash: 'h1' }),
      record('repository', 'edited', { hash: 'local' }),
      record('repository', 'same', { hash: 'shared' }),
    ];
    const disk = [record('repository', 'edited', { hash: 'disk' }), record('repository', 'same', { hash: 'shared' })];

    const plan = reconcile({
      direction: 'export',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local,
      disk,
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });

    expect(entryByKey(plan, 'repository:*:fresh').status).toBe('new');
    expect(entryByKey(plan, 'repository:*:edited').status).toBe('changed');
    expect(entryByKey(plan, 'repository:*:same').status).toBe('unchanged');
  });
});

describe('feature: default selection matrix', () => {
  test('export selects new and changed; import selects only new', () => {
    const local = [record('repository', 'edited', { hash: 'local' }), record('repository', 'fresh', { hash: 'h' })];
    const disk = [record('repository', 'edited', { hash: 'disk' })];

    const exportPlan = reconcile({
      direction: 'export',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local,
      disk,
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });
    expect(entryByKey(exportPlan, 'repository:*:edited').selected).toBe(true);
    expect(entryByKey(exportPlan, 'repository:*:fresh').selected).toBe(true);

    // For import, disk is the source. 'edited' differs (changed), 'fresh' is new.
    const importPlan = reconcile({
      direction: 'import',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local: [record('repository', 'edited', { hash: 'disk-side' })],
      disk: [record('repository', 'edited', { hash: 'local-side' }), record('repository', 'fresh', { hash: 'h' })],
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });
    expect(entryByKey(importPlan, 'repository:*:edited').status).toBe('changed');
    expect(entryByKey(importPlan, 'repository:*:edited').selected).toBe(false);
    expect(entryByKey(importPlan, 'repository:*:fresh').selected).toBe(true);
  });
});

describe('feature: blocked cascade', () => {
  test('import blocks a document whose new project is unselected, and toggling the project unblocks it', () => {
    const projectDep: DependencyRef = {
      key: reconcileKey('project', undefined, 'Alpha'),
      entityType: 'project',
      name: 'Alpha',
      syncable: true,
    };
    const disk = [
      record('project', 'Alpha', { hash: 'p' }),
      record('document', 'Runbook', { projectName: 'Alpha', hash: 'd', deps: [projectDep] }),
    ];

    const plan = reconcile({
      direction: 'import',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local: [],
      disk,
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });

    const projectKey = reconcileKey('project', undefined, 'Alpha');
    const documentKey = reconcileKey('document', 'Alpha', 'Runbook');

    // Both are new; project defaults selected so the document resolves.
    expect(entryByKey(plan, projectKey).selected).toBe(true);
    expect(entryByKey(plan, documentKey).status).toBe('new');

    // Deselect the project: the document can no longer resolve and is blocked.
    const deselected = toggleSelection(plan, projectKey, false);
    expect(entryByKey(deselected, documentKey).status).toBe('blocked');
    expect(entryByKey(deselected, documentKey).blockedBy).toContain('Alpha');

    // Reselect: the document unblocks.
    const reselected = toggleSelection(deselected, projectKey, true);
    expect(entryByKey(reselected, documentKey).status).toBe('new');
  });

  test('a dependency already present on the destination satisfies without selection', () => {
    const profileDep: DependencyRef = {
      key: 'inferenceProfile:*:GPT',
      entityType: 'inferenceProfile',
      name: 'GPT',
      syncable: false,
    };
    const disk = [record('agentRegistry', 'Coder', { projectName: 'Alpha', hash: 'a', deps: [profileDep] })];

    const blocked = reconcile({
      direction: 'import',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local: [record('project', 'Alpha', { hash: 'p' })],
      disk,
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });
    expect(entryByKey(blocked, reconcileKey('agentRegistry', 'Alpha', 'Coder')).status).toBe('blocked');

    const satisfied = reconcile({
      direction: 'import',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local: [record('project', 'Alpha', { hash: 'p' })],
      disk,
      ambientKeys: ['inferenceProfile:*:GPT'],
      dependenciesOf: depsFromFields,
      warnings: [],
    });
    expect(entryByKey(satisfied, reconcileKey('agentRegistry', 'Alpha', 'Coder')).status).toBe('new');
  });
});

describe('feature: orphan detection and scope', () => {
  test('export reports disk records with no local counterpart as orphans', () => {
    const plan = reconcile({
      direction: 'export',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local: [record('repository', 'kept', { hash: 'h' })],
      disk: [record('repository', 'kept', { hash: 'h' }), record('repository', 'stale', { hash: 'old' })],
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });
    expect(plan.orphans).toEqual(['repository:*:stale']);
  });

  test('export scope excludes out-of-scope projects but keeps global repositories', () => {
    const plan = reconcile({
      direction: 'export',
      directory: '/tmp/x',
      scope: { projectNames: ['Alpha'] },
      local: [
        record('project', 'Alpha', { hash: 'p' }),
        record('project', 'Beta', { hash: 'p' }),
        record('document', 'InAlpha', { projectName: 'Alpha', hash: 'd' }),
        record('document', 'InBeta', { projectName: 'Beta', hash: 'd' }),
        record('repository', 'global', { hash: 'r' }),
      ],
      disk: [],
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });
    const keys = plan.entries.map((entry) => entry.key).sort();
    expect(keys).toEqual(['document:Alpha:InAlpha', 'project:*:Alpha', 'repository:*:global']);
  });

  test('import never produces orphans', () => {
    const plan = reconcile({
      direction: 'import',
      directory: '/tmp/x',
      scope: { projectNames: [] },
      local: [record('repository', 'localOnly', { hash: 'h' })],
      disk: [record('repository', 'diskOnly', { hash: 'h' })],
      ambientKeys: [],
      dependenciesOf: depsFromFields,
      warnings: [],
    });
    expect(plan.orphans).toEqual([]);
  });
});
