/**
 * Defines the ReadDocumentOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ReadDocumentOperation {
  name: 'readDocument';
  request: {
    id: string;
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
