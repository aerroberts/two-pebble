export interface TaskPoolUpdatedEvent {
  name: 'taskPoolUpdated';
  payload: {
    id: string;
    createdAt: number;
    updatedAt: number;
    boardId: string;
    parentPoolId: string | null;
    name: string;
  };
}

export interface TaskPoolDeletedEvent {
  name: 'taskPoolDeleted';
  payload: {
    id: string;
    boardId: string;
  };
}
