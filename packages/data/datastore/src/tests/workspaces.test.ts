import { describe, expect, test } from 'bun:test';
import { sampleWorkspaceInput } from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation workspaces.create', () => {
  test('happy: creates a workspace pointing at a path', async () => {
    const datastore = await useDatastoreForTesting();
    const workspace = await datastore.workspaces.create(sampleWorkspaceInput);
    await datastore.close();
    expect(workspace.path).toBe('/tmp/workspace');
  });
});

describe('feature: operation workspaces.read', () => {
  test('happy: reads a workspace by id', async () => {
    const datastore = await useDatastoreForTesting();
    const workspace = await datastore.workspaces.create(sampleWorkspaceInput);
    const read = await datastore.workspaces.read({ id: workspace.id });
    await datastore.close();
    expect(read.id).toBe(workspace.id);
  });
});

describe('feature: operation workspaces.list', () => {
  test('happy: lists registered workspaces', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.workspaces.create(sampleWorkspaceInput);
    const list = await datastore.workspaces.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});
