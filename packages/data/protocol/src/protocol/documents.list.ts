export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  content: string;
}

export interface DocumentsListOperation {
  name: 'listDocuments';
  request: {
    limit?: number;
    offset?: number;
  };
  response: {
    items: DocumentRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
