export interface TaskUpdatedEvent {
  name: 'taskUpdated';
  payload: {
    id: string;
    createdAt: number;
    updatedAt: number;
    boardId: string;
    poolId: string | null;
    name: string;
    description: string;
    ownerId: string | null;
    status: 'pending' | 'working' | 'waiting' | 'success' | 'failure';
    effectiveStatus: 'blocked' | 'open' | 'working' | 'waiting' | 'success' | 'failure';
  };
}

export interface TaskDeletedEvent {
  name: 'taskDeleted';
  payload: {
    id: string;
    boardId: string;
  };
}
