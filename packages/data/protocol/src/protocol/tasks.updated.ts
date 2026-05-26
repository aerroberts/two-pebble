/**
 * Defines the TaskUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
    templateId: string | null;
    additionalContext: string;
    ownerId: string | null;
    status: 'pending' | 'working' | 'waiting' | 'success' | 'failure' | 'canceled';
    effectiveStatus: 'blocked' | 'open' | 'working' | 'waiting' | 'success' | 'failure' | 'canceled';
  };
}

/**
 * Defines the TaskDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeletedEvent {
  name: 'taskDeleted';
  payload: {
    id: string;
    boardId: string;
  };
}
