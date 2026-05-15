import type { DocumentRecord } from './documents.list';

export interface ReadDocumentOperation {
  name: 'readDocument';
  request: {
    id: string;
  };
  response: DocumentRecord;
}
