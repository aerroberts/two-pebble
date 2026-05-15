import type { DocumentRecord } from './documents.list';

export interface UpdateDocumentOperation {
  name: 'updateDocument';
  request: {
    content?: string;
    id: string;
    name?: string;
  };
  response: DocumentRecord;
}
