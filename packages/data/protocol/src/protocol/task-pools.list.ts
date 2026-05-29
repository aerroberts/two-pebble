/**
 * Defines the TaskPoolRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskPoolRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  parentPoolId: string | null;
  name: string;
  defaultTemplateId: string | null;
}

/**
 * Defines the TaskPoolsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskPoolsListOperation {
  name: 'listTaskPools';
  request: {
    boardId: string;
  };
  response: {
    items: TaskPoolRecord[];
  };
}
