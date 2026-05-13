export interface TaskBoardUpdatedEvent {
  name: 'taskBoardUpdated';
  payload: {
    id: string;
    createdAt: number;
    updatedAt: number;
    name: string;
  };
}

export interface TaskBoardDeletedEvent {
  name: 'taskBoardDeleted';
  payload: {
    id: string;
  };
}
