export interface TaskDependenciesCreateOperation {
  name: 'createTaskDependency';
  request: {
    boardId: string;
    fromId: string;
    toId: string;
  };
  response: {
    id: string;
  };
}
