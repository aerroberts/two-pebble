export interface RepositoriesUpdateOperation {
  name: 'updateRepository';
  request: {
    baseBranch?: string;
    id: string;
    name?: string;
    path?: string;
  };
  response: {
    id: string;
  };
}
