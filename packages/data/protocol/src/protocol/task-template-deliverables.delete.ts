/**
 * Defines the TaskTemplateDeliverablesDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateDeliverablesDeleteOperation {
  name: 'deleteTaskTemplateDeliverable';
  request: { id: string };
  response: { id: string };
}
