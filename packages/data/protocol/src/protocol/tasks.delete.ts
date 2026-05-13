export interface TasksDeleteOperation {
  name: 'deleteTask';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
