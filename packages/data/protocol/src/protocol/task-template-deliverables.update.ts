import type { TaskDeliverableType, TaskTemplateDeliverableRecord } from './task-deliverable-types';

export interface TaskTemplateDeliverablesUpdateOperation {
  name: 'updateTaskTemplateDeliverable';
  request: { id: string; name?: string; description?: string; type?: TaskDeliverableType; orderIndex?: number };
  response: { deliverable: TaskTemplateDeliverableRecord };
}
