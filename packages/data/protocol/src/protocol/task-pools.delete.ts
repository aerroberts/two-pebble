export interface TaskPoolsDeleteOperation {
  name: 'deleteTaskPool';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
