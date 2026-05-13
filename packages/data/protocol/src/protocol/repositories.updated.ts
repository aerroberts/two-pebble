interface RepositoryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  path: string;
  baseBranch: string;
}

export interface RepositoriesUpdatedEvent {
  name: 'repositoryUpdated';
  payload: RepositoryRecord;
}
