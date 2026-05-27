/**
 * Defines the TaskBoardRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  projectId: string;
  /**
   * Task template applied to new tasks on this board when the caller does
   * not pass a templateId. `null` means no default — task creation works
   * unchanged.
   */
  defaultTemplateId: string | null;
}

/**
 * Defines the TaskBoardsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardsListOperation {
  name: 'listTaskBoards';
  request: {
    projectId?: string;
  };
  response: {
    items: TaskBoardRecord[];
  };
}
