import type { TaskTemplateRecord } from './task-deliverable-types';

export interface TaskTemplateUpdatedEvent {
  name: 'taskTemplateUpdated';
  payload: TaskTemplateRecord;
}
