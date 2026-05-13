export interface TaskBoardsUpdateOperation {
  name: 'updateTaskBoard';
  request: {
    id: string;
    name: string;
  };
  response: {
    id: string;
  };
}
