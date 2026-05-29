import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation skills.create', () => {
  test('happy: creates a skill row with defaults', async () => {
    const datastore = await useDatastoreForTesting();
    const skill = await datastore.skills.create({ diskFolderPath: '/tmp/log-access' });
    await datastore.close();
    expect(skill.name).toBe('Untitled');
    expect(skill.description).toBe('');
    expect(skill.diskFolderPath).toBe('/tmp/log-access');
    expect(skill.archivedAt).toBeNull();
  });

  test('happy: persists supplied name and description', async () => {
    const datastore = await useDatastoreForTesting();
    const skill = await datastore.skills.create({
      description: 'Reads access logs',
      diskFolderPath: '/tmp/log-access',
      name: 'Log access',
    });
    await datastore.close();
    expect(skill.name).toBe('Log access');
    expect(skill.description).toBe('Reads access logs');
  });
});

describe('feature: operation skills.read', () => {
  test('happy: reads a skill by id', async () => {
    const datastore = await useDatastoreForTesting();
    const skill = await datastore.skills.create({ diskFolderPath: '/tmp/log-access', name: 'Log access' });
    const read = await datastore.skills.read({ id: skill.id });
    await datastore.close();
    expect(read.id).toBe(skill.id);
  });

  test('archived: read throws on archived (soft-deleted) skills', async () => {
    const datastore = await useDatastoreForTesting();
    const skill = await datastore.skills.create({ diskFolderPath: '/tmp/log-access', name: 'Log access' });
    await datastore.skills.delete({ id: skill.id });
    await expect(datastore.skills.read({ id: skill.id })).rejects.toThrow(/not found/);
    await datastore.close();
  });
});

describe('feature: operation skills.list', () => {
  test('happy: lists active skills', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.skills.create({ diskFolderPath: '/tmp/log-access', name: 'Log access' });
    const list = await datastore.skills.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });

  test('archived: excludes soft-deleted skills from listings', async () => {
    const datastore = await useDatastoreForTesting();
    const skill = await datastore.skills.create({ diskFolderPath: '/tmp/log-access', name: 'Log access' });
    await datastore.skills.delete({ id: skill.id });
    const list = await datastore.skills.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(0);
  });

  test('scoping: lists only the requested project', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.skills.create({ diskFolderPath: '/tmp/a', name: 'A', projectId: 'proj_a' });
    await datastore.skills.create({ diskFolderPath: '/tmp/b', name: 'B', projectId: 'proj_b' });
    const list = await datastore.skills.list({ limit: 50, offset: 0, projectId: 'proj_a' });
    await datastore.close();
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.name).toBe('A');
  });
});

describe('feature: operation skills.update', () => {
  test('happy: updates only the supplied fields', async () => {
    const datastore = await useDatastoreForTesting();
    const skill = await datastore.skills.create({ diskFolderPath: '/tmp/log-access', name: 'Log access' });
    const updated = await datastore.skills.update({ id: skill.id, name: 'Renamed' });
    await datastore.close();
    expect(updated.name).toBe('Renamed');
    expect(updated.diskFolderPath).toBe(skill.diskFolderPath);
  });
});

describe('feature: operation skills.delete', () => {
  test('happy: soft-deletes a skill', async () => {
    const datastore = await useDatastoreForTesting();
    const skill = await datastore.skills.create({ diskFolderPath: '/tmp/log-access', name: 'Log access' });
    const deleted = await datastore.skills.delete({ id: skill.id });
    await datastore.close();
    expect(deleted.id).toBe(skill.id);
  });
});
