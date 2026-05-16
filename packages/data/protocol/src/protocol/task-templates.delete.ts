/**
 * Defines the TaskTemplatesDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplatesDeleteOperation {
  name: 'deleteTaskTemplate';
  request: { id: string };
  response: { id: string };
}
