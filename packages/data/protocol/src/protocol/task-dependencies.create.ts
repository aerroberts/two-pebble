/**
 * Defines the TaskDependenciesCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDependenciesCreateOperation {
  name: 'createTaskDependency';
  request: {
    boardId: string;
    fromId: string;
    toId: string;
  };
  response: {
    id: string;
  };
}
