/**
 * Defines the RepositoriesDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface RepositoriesDeleteOperation {
  name: 'deleteRepository';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
