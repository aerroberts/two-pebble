export interface TasksRenameOperation {
  name: 'renameTask';
  request: {
    id: string;
    name: string;
  };
  response: {
    id: string;
  };
}
