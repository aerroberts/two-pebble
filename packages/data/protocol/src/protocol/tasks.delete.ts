/**
 * Defines the TasksDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TasksDeleteOperation {
  name: 'deleteTask';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
