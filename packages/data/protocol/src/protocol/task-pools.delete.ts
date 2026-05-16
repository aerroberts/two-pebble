/**
 * Defines the TaskPoolsDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskPoolsDeleteOperation {
  name: 'deleteTaskPool';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
