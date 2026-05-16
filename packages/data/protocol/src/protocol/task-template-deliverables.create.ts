import type { TaskDeliverableType, TaskTemplateDeliverableRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplateDeliverablesCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateDeliverablesCreateOperation {
  name: 'createTaskTemplateDeliverable';
  request: { templateId: string; name: string; description?: string; type: TaskDeliverableType; orderIndex?: number };
  response: { deliverable: TaskTemplateDeliverableRecord };
}
