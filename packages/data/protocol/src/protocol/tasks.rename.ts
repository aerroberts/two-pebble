/**
 * Defines the TasksRenameOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TasksRenameOperation {
  name: 'renameTask';
  request: {
    id: string;
    name: string;
  };
  response: {
    id: string;
  };
}
