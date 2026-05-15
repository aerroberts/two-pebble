import type { DocumentRecord } from './documents.list';

export interface CreateDocumentOperation {
  name: 'createDocument';
  request: {
    content?: string;
    name?: string;
  };
  response: DocumentRecord;
}
