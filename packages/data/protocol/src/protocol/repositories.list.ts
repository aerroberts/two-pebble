export interface RepositoryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  path: string;
  baseBranch: string;
}

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
