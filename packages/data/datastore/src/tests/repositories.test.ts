import { describe, expect, test } from 'bun:test';
import { sampleRepositoryInput } from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation repositories.create', () => {
  test('happy: creates a repository row', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    await datastore.close();
    expect(repository.name).toBe('Sample');
  });
});

describe('feature: operation repositories.read', () => {
  test('happy: reads a repository by id', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    const read = await datastore.repositories.read({ id: repository.id });
    await datastore.close();
    expect(read.id).toBe(repository.id);
  });
});

describe('feature: operation repositories.list', () => {
  test('happy: lists registered repositories', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.repositories.create(sampleRepositoryInput);
    const list = await datastore.repositories.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation repositories.update', () => {
  test('happy: updates the repository name', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    const updated = await datastore.repositories.update({ id: repository.id, name: 'Renamed' });
    await datastore.close();
    expect(updated.name).toBe('Renamed');
  });
});

describe('feature: operation repositories.delete', () => {
  test('happy: deletes a repository', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    const deleted = await datastore.repositories.delete({ id: repository.id });
    await datastore.close();
    expect(deleted.id).toBe(repository.id);
  });
});
