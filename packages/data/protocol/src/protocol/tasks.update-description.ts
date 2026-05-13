export interface TasksUpdateDescriptionOperation {
  name: 'updateTaskDescription';
  request: {
    id: string;
    description: string;
  };
  response: {
    id: string;
  };
}
