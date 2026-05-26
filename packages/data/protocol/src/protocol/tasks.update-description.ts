/**
 * Defines the TasksUpdateDescriptionOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TasksUpdateDescriptionOperation {
  name: 'updateTaskDescription';
  request: {
    id: string;
    description: string;
    descriptionContent?: string | null;
  };
  response: {
    id: string;
  };
}
