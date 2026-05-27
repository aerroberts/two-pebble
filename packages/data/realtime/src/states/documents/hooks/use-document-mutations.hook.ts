'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type { CreateDocumentInput, DeleteDocumentInput, UpdateDocumentInput } from '../types';

export function useDocumentMutations() {
  const datastore = useRealtimeDatastore();

  return {
    createDocument: (input: CreateDocumentInput) => datastore.documents.create(input),
    deleteDocument: (input: DeleteDocumentInput) => datastore.documents.delete(input),
    renameDocument: (input: Pick<UpdateDocumentInput, 'id' | 'name'>) => datastore.documents.update(input),
    updateDocumentContent: (input: Pick<UpdateDocumentInput, 'content' | 'id'>) => datastore.documents.update(input),
    setDocumentSection: (input: Pick<UpdateDocumentInput, 'id' | 'section'>) => datastore.documents.update(input),
  };
}
