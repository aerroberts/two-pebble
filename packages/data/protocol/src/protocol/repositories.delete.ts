export interface RepositoriesDeleteOperation {
  name: 'deleteRepository';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
