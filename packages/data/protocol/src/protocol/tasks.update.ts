/**
 * Defines the TasksUpdateStatusOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TasksUpdateStatusOperation {
  name: 'setTaskStatus';
  request: {
    id: string;
    status: 'working' | 'waiting' | 'success' | 'failure';
    reason: string;
  };
  response: {
    id: string;
  };
}
