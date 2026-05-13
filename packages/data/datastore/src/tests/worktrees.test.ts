import { describe, expect, test } from 'bun:test';
import { sampleRepositoryInput, sampleWorktreeInput } from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation worktrees.create', () => {
  test('happy: inserts a worktree in creating status', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    const worktree = await datastore.worktrees.create({ ...sampleWorktreeInput, repositoryId: repository.id });
    await datastore.close();
    expect(worktree.status).toBe('creating');
  });
});

describe('feature: operation worktrees.read', () => {
  test('happy: reads a worktree by id', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    const worktree = await datastore.worktrees.create({ ...sampleWorktreeInput, repositoryId: repository.id });
    const read = await datastore.worktrees.read({ id: worktree.id });
    await datastore.close();
    expect(read.id).toBe(worktree.id);
  });
});

describe('feature: operation worktrees.list', () => {
  test('happy: lists worktrees', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    await datastore.worktrees.create({ ...sampleWorktreeInput, repositoryId: repository.id });
    const list = await datastore.worktrees.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation worktrees.update', () => {
  test('happy: transitions worktree status', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    const worktree = await datastore.worktrees.create({ ...sampleWorktreeInput, repositoryId: repository.id });
    const updated = await datastore.worktrees.update({ id: worktree.id, status: 'active' });
    await datastore.close();
    expect(updated.status).toBe('active');
  });
});

describe('feature: operation worktrees.delete', () => {
  test('happy: removes a worktree row', async () => {
    const datastore = await useDatastoreForTesting();
    const repository = await datastore.repositories.create(sampleRepositoryInput);
    const worktree = await datastore.worktrees.create({ ...sampleWorktreeInput, repositoryId: repository.id });
    const deleted = await datastore.worktrees.delete({ id: worktree.id });
    await datastore.close();
    expect(deleted.id).toBe(worktree.id);
  });
});
