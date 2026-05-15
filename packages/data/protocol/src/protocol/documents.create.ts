export interface CreateDocumentOperation {
  name: 'createDocument';
  request: {
    content?: string;
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
