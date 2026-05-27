import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation projects.create', () => {
  test('happy: creates a project row', async () => {
    const datastore = await useDatastoreForTesting();
    const project = await datastore.projects.create({
      assistantAgentId: 'agent-1',
      assistantAgentRegistryId: 'registry-1',
      name: 'Project Alpha',
    });
    await datastore.close();
    expect(project).toMatchObject({
      assistantAgentId: 'agent-1',
      assistantAgentRegistryId: 'registry-1',
      name: 'Project Alpha',
    });
  });
});

describe('feature: operation projects.list', () => {
  test('happy: lists projects', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.projects.create({ name: 'Project Alpha' });
    const list = await datastore.projects.list({});
    await datastore.close();
    expect(list.items.map((project) => project.name)).toEqual(['Default', 'Project Alpha']);
  });
});

describe('feature: operation projects.update', () => {
  test('happy: updates project settings', async () => {
    const datastore = await useDatastoreForTesting();
    const project = await datastore.projects.create({ name: 'Project Alpha' });
    const updated = await datastore.projects.update({
      assistantAgentId: 'agent-2',
      assistantAgentRegistryId: 'registry-2',
      id: project.id,
      name: 'Project Beta',
    });
    await datastore.close();
    expect(updated).toMatchObject({
      assistantAgentId: 'agent-2',
      assistantAgentRegistryId: 'registry-2',
      name: 'Project Beta',
    });
  });
});

describe('feature: operation projects.delete', () => {
  test('happy: deletes a project row', async () => {
    const datastore = await useDatastoreForTesting();
    const project = await datastore.projects.create({ name: 'Project Alpha' });
    const deleted = await datastore.projects.delete({ id: project.id });
    const list = await datastore.projects.list({});
    await datastore.close();
    expect(deleted.id).toBe(project.id);
    expect(list.items.map((item) => item.id)).not.toContain(project.id);
  });
});
