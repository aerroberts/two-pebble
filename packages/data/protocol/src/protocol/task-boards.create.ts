/**
 * Defines the TaskBoardsCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardsCreateOperation {
  name: 'createTaskBoard';
  request: {
    name: string;
  };
  response: {
    id: string;
  };
}
