/**
 * Defines the TaskDeliverablesDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverablesDeleteOperation {
  name: 'deleteTaskDeliverable';
  request: { id: string };
  response: { id: string };
}

/**
 * Defines the TaskDeliverableDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverableDeletedEvent {
  name: 'taskDeliverableDeleted';
  payload: { id: string };
}
