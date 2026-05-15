export interface UpdateDocumentOperation {
  name: 'updateDocument';
  request: {
    content?: string;
    id: string;
    name?: string;
  };
  response: DocumentRecord;
}

export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  content: string;
  references: string;
}
