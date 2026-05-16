interface RepositoryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  path: string;
  baseBranch: string;
}

/**
 * Defines the RepositoriesUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface RepositoriesUpdatedEvent {
  name: 'repositoryUpdated';
  payload: RepositoryRecord;
}
