/**
 * Defines the ProtocolTaskRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ProtocolTaskRecord {
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
  status: 'pending' | 'working' | 'waiting' | 'success' | 'failure';
  effectiveStatus: 'blocked' | 'open' | 'working' | 'waiting' | 'success' | 'failure';
}

/**
 * Defines the TasksListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TasksListOperation {
  name: 'listTasks';
  request: {
    boardId: string;
  };
  response: {
    items: ProtocolTaskRecord[];
  };
}
