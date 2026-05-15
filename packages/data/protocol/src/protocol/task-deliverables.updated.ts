import type { TaskDeliverableRecord } from './task-deliverable-types';

export interface TaskDeliverableUpdatedEvent {
  name: 'taskDeliverableUpdated';
  payload: TaskDeliverableRecord;
}
