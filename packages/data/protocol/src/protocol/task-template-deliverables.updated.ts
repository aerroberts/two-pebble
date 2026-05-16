import type { TaskTemplateDeliverableRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplateDeliverableUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateDeliverableUpdatedEvent {
  name: 'taskTemplateDeliverableUpdated';
  payload: TaskTemplateDeliverableRecord;
}
