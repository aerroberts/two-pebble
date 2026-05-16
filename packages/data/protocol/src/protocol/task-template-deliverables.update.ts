import type { TaskDeliverableType, TaskTemplateDeliverableRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplateDeliverablesUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateDeliverablesUpdateOperation {
  name: 'updateTaskTemplateDeliverable';
  request: { id: string; name?: string; description?: string; type?: TaskDeliverableType; orderIndex?: number };
  response: { deliverable: TaskTemplateDeliverableRecord };
}
