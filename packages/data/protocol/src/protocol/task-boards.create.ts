export interface TaskBoardsCreateOperation {
  name: 'createTaskBoard';
  request: {
    name: string;
  };
  response: {
    id: string;
  };
}
