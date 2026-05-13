export interface TaskDependenciesDeleteOperation {
  name: 'deleteTaskDependency';
  request: {
    fromId: string;
    toId: string;
  };
  response: {
    fromId: string;
    toId: string;
  };
}
