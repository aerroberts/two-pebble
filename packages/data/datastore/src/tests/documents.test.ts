import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation documents.create', () => {
  test('happy: creates a document row with default content', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({});
    await datastore.close();
    expect(document.name).toBe('Untitled');
    expect(document.content).toBe('{"type":"doc","content":[]}');
  });
});

describe('feature: operation documents.read', () => {
  test('happy: reads a document by id', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook' });
    const read = await datastore.documents.read({ id: document.id });
    await datastore.close();
    expect(read.id).toBe(document.id);
  });
});

describe('feature: operation documents.list', () => {
  test('happy: lists documents', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.documents.create({ name: 'Runbook' });
    const list = await datastore.documents.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation documents.update', () => {
  test('happy: updates only the supplied fields', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ content: '{"type":"doc","content":[]}', name: 'Runbook' });
    const updated = await datastore.documents.update({ id: document.id, name: 'Renamed' });
    await datastore.close();
    expect(updated.name).toBe('Renamed');
    expect(updated.content).toBe(document.content);
  });
});

describe('feature: operation documents.delete', () => {
  test('happy: deletes a document', async () => {
    const datastore = await useDatastoreForTesting();
    const document = await datastore.documents.create({ name: 'Runbook' });
    const deleted = await datastore.documents.delete({ id: document.id });
    await datastore.close();
    expect(deleted.id).toBe(document.id);
  });
});
