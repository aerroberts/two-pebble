/**
 * Defines the TaskDependencyRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDependencyRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  fromId: string;
  toId: string;
}

/**
 * Defines the TaskDependenciesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDependenciesListOperation {
  name: 'listTaskDependencies';
  request: {
    boardId: string;
  };
  response: {
    items: TaskDependencyRecord[];
  };
}
