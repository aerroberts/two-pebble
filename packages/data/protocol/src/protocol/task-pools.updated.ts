/**
 * Defines the TaskPoolUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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

/**
 * Defines the TaskPoolDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskPoolDeletedEvent {
  name: 'taskPoolDeleted';
  payload: {
    id: string;
    boardId: string;
  };
}
