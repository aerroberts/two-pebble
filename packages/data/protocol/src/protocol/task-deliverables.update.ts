import type { TaskDeliverableRecord, TaskDeliverableType } from './task-deliverable-types';

/**
 * Defines the TaskDeliverablesUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverablesUpdateOperation {
  name: 'updateTaskDeliverable';
  request: { id: string; name?: string; description?: string; type?: TaskDeliverableType; orderIndex?: number };
  response: { deliverable: TaskDeliverableRecord };
}
