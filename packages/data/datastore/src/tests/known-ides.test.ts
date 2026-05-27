import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation known-ides.create', () => {
  test('happy: creates a known IDE row', async () => {
    const datastore = await useDatastoreForTesting();
    const ide = await datastore.knownIdes.create({
      kind: 'vscode',
      displayName: 'VS Code',
      executablePath: '/usr/local/bin/code',
    });
    await datastore.close();
    expect(ide).toMatchObject({
      kind: 'vscode',
      displayName: 'VS Code',
      executablePath: '/usr/local/bin/code',
    });
  });
});

describe('feature: operation known-ides.list', () => {
  test('happy: lists known IDE rows', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.knownIdes.create({
      kind: 'zed',
      displayName: 'Zed',
      executablePath: '/usr/local/bin/zed',
    });
    const list = await datastore.knownIdes.list({});
    await datastore.close();
    expect(list.items).toContainEqual(expect.objectContaining({ kind: 'zed', displayName: 'Zed' }));
  });
});

describe('feature: operation known-ides.read', () => {
  test('happy: reads a known IDE row', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.knownIdes.create({
      kind: 'cursor',
      displayName: 'Cursor',
      executablePath: '/usr/local/bin/cursor',
    });
    const read = await datastore.knownIdes.read({ id: created.id });
    await datastore.close();
    expect(read).toMatchObject({ id: created.id, kind: 'cursor', displayName: 'Cursor' });
  });
});

describe('feature: operation known-ides.delete', () => {
  test('happy: deletes a known IDE row', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.knownIdes.create({
      kind: 'other',
      displayName: 'Other IDE',
      executablePath: '/usr/local/bin/editor',
    });
    await datastore.knownIdes.delete({ id: created.id });
    const list = await datastore.knownIdes.list({});
    await datastore.close();
    expect(list.items).toEqual([]);
  });
});
