import type { TaskDeliverableType, TaskTemplateDeliverableRecord } from './task-deliverable-types';

export interface TaskTemplateDeliverablesCreateOperation {
  name: 'createTaskTemplateDeliverable';
  request: { templateId: string; name: string; description?: string; type: TaskDeliverableType; orderIndex?: number };
  response: { deliverable: TaskTemplateDeliverableRecord };
}
