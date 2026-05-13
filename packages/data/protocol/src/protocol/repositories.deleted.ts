export interface RepositoriesDeletedEvent {
  name: 'repositoryDeleted';
  payload: {
    id: string;
  };
}
