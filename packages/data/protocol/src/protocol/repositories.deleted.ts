/**
 * Defines the RepositoriesDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface RepositoriesDeletedEvent {
  name: 'repositoryDeleted';
  payload: {
    id: string;
  };
}
