/**
 * Defines the UpdateDocumentOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface UpdateDocumentOperation {
  name: 'updateDocument';
  request: {
    content?: string;
    id: string;
    name?: string;
  };
  response: DocumentRecord;
}

/**
 * Defines the DocumentRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  content: string;
  references: string;
}
