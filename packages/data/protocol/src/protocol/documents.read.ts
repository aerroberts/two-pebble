export interface ReadDocumentOperation {
  name: 'readDocument';
  request: {
    id: string;
  };
  response: DocumentRecord;
}

export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  content: string;
}
