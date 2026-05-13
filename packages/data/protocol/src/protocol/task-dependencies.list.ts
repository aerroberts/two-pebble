export interface TaskDependencyRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  fromId: string;
  toId: string;
}

export interface TaskDependenciesListOperation {
  name: 'listTaskDependencies';
  request: {
    boardId: string;
  };
  response: {
    items: TaskDependencyRecord[];
  };
}
