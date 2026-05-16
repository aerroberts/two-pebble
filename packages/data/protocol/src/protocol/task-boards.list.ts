/**
 * Defines the TaskBoardRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
}

/**
 * Defines the TaskBoardsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardsListOperation {
  name: 'listTaskBoards';
  request: Record<string, never>;
  response: {
    items: TaskBoardRecord[];
  };
}
