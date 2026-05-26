import type { TaskDeliverableRecord, TaskDeliverableType } from './task-deliverable-types';

/**
 * Defines the TaskDeliverablesCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverablesCreateOperation {
  name: 'createTaskDeliverable';
  request: { taskId: string; name: string; description?: string; type: TaskDeliverableType; orderIndex?: number };
  response: { deliverable: TaskDeliverableRecord };
}
