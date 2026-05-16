/**
 * Defines the DeleteDocumentOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DeleteDocumentOperation {
  name: 'deleteDocument';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
