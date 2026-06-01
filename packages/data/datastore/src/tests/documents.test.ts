import { describe, expect, test } from 'bun:test';
import { createEmptyTipTapDocument } from '@two-pebble/datatypes';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation documents.create', () => {
  test('happy: creates a document row with default content', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ projectId: 'proj_default' });
    await datastore.close();
    expect(document.name).toBe('Untitled');
    expect(document.content).toBe(JSON.stringify(createEmptyTipTapDocument()));
  });
});

describe('feature: operation documents.read', () => {
  test('happy: reads a document by id', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook', projectId: 'proj_default' });
    const read = await datastore.documents.read({ id: document.id });
    await datastore.close();
    expect(read.id).toBe(document.id);
  });

  test('archived: read throws on archived (soft-deleted) documents', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook', projectId: 'proj_default' });
    await datastore.documents.delete({ id: document.id });
    await expect(datastore.documents.read({ id: document.id })).rejects.toThrow(/not found/);
    await datastore.close();
  });
});

describe('feature: operation documents.list', () => {
  test('happy: lists documents', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.documents.create({ name: 'Runbook', projectId: 'proj_default' });
    const list = await datastore.documents.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation documents.update', () => {
  test('happy: updates only the supplied fields', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({
      content: JSON.stringify(createEmptyTipTapDocument()),
      name: 'Runbook',
      projectId: 'proj_default',
    });
    const updated = await datastore.documents.update({ id: document.id, name: 'Renamed' });
    await datastore.close();
    expect(updated.name).toBe('Renamed');
    expect(updated.content).toBe(document.content);
  });

  test('happy: write lands when expectedUpdatedAt matches the stored revision', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook', projectId: 'proj_default' });
    const updated = await datastore.documents.update({
      id: document.id,
      name: 'Renamed',
      expectedUpdatedAt: document.updatedAt,
    });
    await datastore.close();
    expect(updated.name).toBe('Renamed');
  });

  test('conflict: rejects a write whose expectedUpdatedAt is stale', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook', projectId: 'proj_default' });
    const staleRevision = document.updatedAt;
    // A concurrent writer moves the row forward. The delay guarantees a
    // distinct millisecond timestamp so the revision actually advances.
    await new Promise((resolve) => setTimeout(resolve, 2));
    const moved = await datastore.documents.update({ id: document.id, name: 'First' });
    expect(moved.updatedAt).not.toBe(staleRevision);
    // The original editor still thinks it is on the old revision.
    await expect(
      datastore.documents.update({ id: document.id, name: 'Second', expectedUpdatedAt: staleRevision }),
    ).rejects.toThrow(/DOCUMENT_UPDATE_CONFLICT/);
    const current = await datastore.documents.read({ id: document.id });
    await datastore.close();
    // The newer edit is preserved; the stale write did not clobber it.
    expect(current.name).toBe('First');
  });

  test('sad: rejects malformed comment content', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook', projectId: 'proj_default' });
    await expect(
      datastore.documents.update({
        id: document.id,
        content: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph', attrs: { cellId: 'cell-1' }, content: [{ type: 'text', text: 'Hello' }] },
            {
              type: 'commentSection',
              attrs: { threads: [{ cellId: 'cell-1', status: 'closed', comments: [] }] },
            },
          ],
        }),
      }),
    ).rejects.toThrow(/closedReason/);
    await datastore.close();
  });
});

describe('feature: operation documents.delete', () => {
  test('happy: deletes a document', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook', projectId: 'proj_default' });
    const deleted = await datastore.documents.delete({ id: document.id });
    await datastore.close();
    expect(deleted.id).toBe(document.id);
  });
});
