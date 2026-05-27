/**
 * Defines the CreateDocumentOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface CreateDocumentOperation {
  name: 'createDocument';
  request: {
    content?: string;
    name?: string;
    projectId?: string;
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
  projectId?: string;
  content: string;
  references: string;
}
