/**
 * Defines the TaskBoardUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardUpdatedEvent {
  name: 'taskBoardUpdated';
  payload: {
    id: string;
    createdAt: number;
    updatedAt: number;
    name: string;
    projectId: string;
  };
}

/**
 * Defines the TaskBoardDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardDeletedEvent {
  name: 'taskBoardDeleted';
  payload: {
    id: string;
  };
}
