/**
 * Defines the TaskBoardsUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskBoardsUpdateOperation {
  name: 'updateTaskBoard';
  request: {
    id: string;
    name: string;
    defaultTemplateId?: string | null;
  };
  response: {
    id: string;
  };
}
