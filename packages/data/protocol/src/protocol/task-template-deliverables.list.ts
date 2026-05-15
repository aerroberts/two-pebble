import type { TaskTemplateDeliverableRecord } from './task-deliverable-types';

export interface TaskTemplateDeliverablesListOperation {
  name: 'listTaskTemplateDeliverables';
  request: { templateId: string };
  response: { items: TaskTemplateDeliverableRecord[] };
}
