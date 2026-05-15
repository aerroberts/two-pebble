import { describe, expect, test } from 'bun:test';
import { listenToDocuments } from './listen';
import { createDocumentsState } from './state';
import type { DocumentRecord, DocumentsState } from './types';

type ListenerMap = {
  documentDeleted?: (payload: { id: string }) => void;
  documentUpdated?: (payload: DocumentRecord) => void;
};

describe('documents realtime listeners', () => {
  test('documentUpdated replaces the registry entry', () => {
    const listeners: ListenerMap = {};
    const datastore = createFakeDatastore(listeners);
    const record = sampleDocument({ name: 'Updated' });

    listenToDocuments({ datastore } as never);
    listeners.documentUpdated?.(record);

    expect(datastore.state.documents.getItem(record.id)?.value?.name).toBe('Updated');
  });

  test('documentDeleted removes the registry entry', () => {
    const listeners: ListenerMap = {};
    const datastore = createFakeDatastore(listeners);
    const record = sampleDocument({ name: 'Deleted' });
    datastore.patch({ documents: datastore.state.documents.withItem(record.id, record, 'ready') });

    listenToDocuments({ datastore } as never);
    listeners.documentDeleted?.({ id: record.id });

    expect(datastore.state.documents.getItem(record.id)).toBeNull();
  });
});

function createFakeDatastore(listeners: ListenerMap) {
  const state: DocumentsState = createDocumentsState();
  return {
    state,
    client: {
      listen: (name: keyof ListenerMap, handler: never) => {
        listeners[name] = handler;
      },
    },
    patch: (patch: Partial<DocumentsState>) => {
      Object.assign(state, patch);
    },
  };
}

function sampleDocument(input: { name: string }): DocumentRecord {
  return {
    id: 'documents:test',
    createdAt: 1,
    updatedAt: 2,
    name: input.name,
    content: '{"type":"doc","content":[]}',
    references: '[]',
  };
}
