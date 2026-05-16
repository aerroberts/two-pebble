import type { TaskTemplateDeliverableRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplateDeliverablesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateDeliverablesListOperation {
  name: 'listTaskTemplateDeliverables';
  request: { templateId: string };
  response: { items: TaskTemplateDeliverableRecord[] };
}
