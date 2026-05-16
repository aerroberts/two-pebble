/**
 * Defines the TaskDependenciesDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDependenciesDeleteOperation {
  name: 'deleteTaskDependency';
  request: {
    fromId: string;
    toId: string;
  };
  response: {
    fromId: string;
    toId: string;
  };
}
