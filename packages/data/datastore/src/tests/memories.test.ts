import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation memories.create', () => {
  test('happy: creates a memory row with the supplied id and path', async () => {
    const datastore = await useDatastoreForTesting();
    const memory = await datastore.memories.create({
      id: 'memories:abc123',
      name: 'Runbook',
      path: '/tmp/memories/memories:abc123',
      projectId: 'proj_1',
    });
    await datastore.close();
    expect(memory.id).toBe('memories:abc123');
    expect(memory.name).toBe('Runbook');
    expect(memory.path).toBe('/tmp/memories/memories:abc123');
    expect(memory.projectId).toBe('proj_1');
  });

  test('happy: generates an id when none is supplied', async () => {
    const datastore = await useDatastoreForTesting();
    const memory = await datastore.memories.create({ name: 'Notes', path: '/tmp/x' });
    await datastore.close();
    expect(memory.id.startsWith('memories:')).toBe(true);
  });
});

describe('feature: operation memories.read', () => {
  test('happy: reads a memory by id', async () => {
    const datastore = await useDatastoreForTesting();
    const memory = await datastore.memories.create({ name: 'Runbook', path: '/tmp/y' });
    const read = await datastore.memories.read({ id: memory.id });
    await datastore.close();
    expect(read.id).toBe(memory.id);
    expect(read.path).toBe('/tmp/y');
  });

  test('sad: read throws when the memory is absent', async () => {
    const datastore = await useDatastoreForTesting();
    await expect(datastore.memories.read({ id: 'memories:missing' })).rejects.toThrow(/not found/);
    await datastore.close();
  });
});

describe('feature: operation memories.list', () => {
  test('happy: lists memories scoped to a project', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.memories.create({ name: 'A', path: '/tmp/a', projectId: 'proj_1' });
    await datastore.memories.create({ name: 'B', path: '/tmp/b', projectId: 'proj_2' });
    const list = await datastore.memories.list({ limit: 50, offset: 0, projectId: 'proj_1' });
    await datastore.close();
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.name).toBe('A');
  });
});

describe('feature: operation memories.update', () => {
  test('happy: renames a memory while keeping the path', async () => {
    const datastore = await useDatastoreForTesting();
    const memory = await datastore.memories.create({ name: 'Old', path: '/tmp/z' });
    const updated = await datastore.memories.update({ id: memory.id, name: 'New' });
    await datastore.close();
    expect(updated.name).toBe('New');
    expect(updated.path).toBe('/tmp/z');
  });

  test('happy: updates a memory path', async () => {
    const datastore = await useDatastoreForTesting();
    const memory = await datastore.memories.create({ name: 'Notes', path: '/tmp/old' });
    const updated = await datastore.memories.update({ id: memory.id, path: '/tmp/new' });
    await datastore.close();
    expect(updated.name).toBe('Notes');
    expect(updated.path).toBe('/tmp/new');
  });
});

describe('feature: operation memories.delete', () => {
  test('happy: hard-deletes the row', async () => {
    const datastore = await useDatastoreForTesting();
    const memory = await datastore.memories.create({ name: 'Temp', path: '/tmp/t' });
    const deleted = await datastore.memories.delete({ id: memory.id });
    await expect(datastore.memories.read({ id: memory.id })).rejects.toThrow(/not found/);
    await datastore.close();
    expect(deleted.id).toBe(memory.id);
  });
});
