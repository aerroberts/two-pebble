/**
 * Defines the RepositoriesCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface RepositoriesCreateOperation {
  name: 'createRepository';
  request: {
    baseBranch: string;
    name: string;
    path: string;
  };
  response: {
    id: string;
  };
}
