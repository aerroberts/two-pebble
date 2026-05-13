import { describe, expect, test } from 'bun:test';
import { sampleAgentRegistryInput } from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation agent-registries.create', () => {
  test('happy: creates an agent registry row', async () => {
    const datastore = await useDatastoreForTesting();
    const registry = await datastore.agentRegistries.create(sampleAgentRegistryInput);
    await datastore.close();
    expect(registry.name).toBe('Sample Agent');
  });
});

describe('feature: operation agent-registries.read', () => {
  test('happy: reads a registry by id', async () => {
    const datastore = await useDatastoreForTesting();
    const registry = await datastore.agentRegistries.create(sampleAgentRegistryInput);
    const read = await datastore.agentRegistries.read({ id: registry.id });
    await datastore.close();
    expect(read.id).toBe(registry.id);
  });
});

describe('feature: operation agent-registries.list', () => {
  test('happy: lists registered agent configurations', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.agentRegistries.create(sampleAgentRegistryInput);
    const list = await datastore.agentRegistries.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation agent-registries.update', () => {
  test('happy: updates the registry name', async () => {
    const datastore = await useDatastoreForTesting();
    const registry = await datastore.agentRegistries.create(sampleAgentRegistryInput);
    const updated = await datastore.agentRegistries.update({ id: registry.id, name: 'Renamed Agent' });
    await datastore.close();
    expect(updated.name).toBe('Renamed Agent');
  });
});

describe('feature: operation agent-registries.delete', () => {
  test('happy: deletes a registry row', async () => {
    const datastore = await useDatastoreForTesting();
    const registry = await datastore.agentRegistries.create(sampleAgentRegistryInput);
    const deleted = await datastore.agentRegistries.delete({ id: registry.id });
    await datastore.close();
    expect(deleted.id).toBe(registry.id);
  });
});
