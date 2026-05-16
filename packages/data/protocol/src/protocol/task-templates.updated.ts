import type { TaskTemplateRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplateUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateUpdatedEvent {
  name: 'taskTemplateUpdated';
  payload: TaskTemplateRecord;
}
