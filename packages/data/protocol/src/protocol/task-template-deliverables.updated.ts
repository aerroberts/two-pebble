import type { TaskTemplateDeliverableRecord } from './task-deliverable-types';

export interface TaskTemplateDeliverableUpdatedEvent {
  name: 'taskTemplateDeliverableUpdated';
  payload: TaskTemplateDeliverableRecord;
}
