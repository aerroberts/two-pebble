export interface TaskBoardsDeleteOperation {
  name: 'deleteTaskBoard';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
