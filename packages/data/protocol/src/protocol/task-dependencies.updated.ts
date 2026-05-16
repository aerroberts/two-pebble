/**
 * Defines the TaskDependencyUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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

/**
 * Defines the TaskDependencyDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDependencyDeletedEvent {
  name: 'taskDependencyDeleted';
  payload: {
    boardId: string;
    fromId: string;
    toId: string;
  };
}
