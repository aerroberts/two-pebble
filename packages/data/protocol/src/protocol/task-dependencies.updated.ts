export interface TaskDependencyUpdatedEvent {
  name: 'taskDependencyUpdated';
  payload: {
    id: string;
    createdAt: number;
    updatedAt: number;
    boardId: string;
    fromId: string;
    toId: string;
  };
}

export interface TaskDependencyDeletedEvent {
  name: 'taskDependencyDeleted';
  payload: {
    boardId: string;
    fromId: string;
    toId: string;
  };
}
