import type { TaskTemplateRecord } from './task-deliverable-types';

export interface TaskTemplatesUpdateOperation {
  name: 'updateTaskTemplate';
  request: { id: string; name?: string; prompt?: string };
  response: { template: TaskTemplateRecord };
}
