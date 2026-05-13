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
