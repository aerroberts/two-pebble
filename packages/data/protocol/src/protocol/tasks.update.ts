export interface TasksUpdateStatusOperation {
  name: 'setTaskStatus';
  request: {
    id: string;
    status: 'working' | 'waiting' | 'success' | 'failure';
    reason: string;
  };
  response: {
    id: string;
  };
}
