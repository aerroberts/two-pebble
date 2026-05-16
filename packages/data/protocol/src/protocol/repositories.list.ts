/**
 * Defines the RepositoryRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface RepositoryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  path: string;
  baseBranch: string;
}

/**
 * Defines the RepositoriesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface RepositoriesListOperation {
  name: 'listRepositories';
  request: {
    limit?: number;
    offset?: number;
  };
  response: {
    items: RepositoryRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
