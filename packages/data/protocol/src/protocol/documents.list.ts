/**
 * Defines the DocumentRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  projectId?: string;
  content: string;
  references: string;
}

/**
 * Defines the DocumentsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DocumentsListOperation {
  name: 'listDocuments';
  request: {
    limit?: number;
    offset?: number;
    projectId?: string;
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
