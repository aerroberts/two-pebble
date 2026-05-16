import type { TaskDeliverableRecord } from './task-deliverable-types';

/**
 * Defines the TaskDeliverableUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverableUpdatedEvent {
  name: 'taskDeliverableUpdated';
  payload: TaskDeliverableRecord;
}
