import type { TaskTemplateRecord } from './task-deliverable-types';

export interface TaskTemplatesReadOperation {
  name: 'readTaskTemplate';
  request: { id: string };
  response: { template: TaskTemplateRecord };
}
