import type { TaskTemplateRecord } from './task-deliverable-types';

export interface TaskTemplatesCreateOperation {
  name: 'createTaskTemplate';
  request: { boardId: string; name: string; prompt?: string };
  response: { template: TaskTemplateRecord };
}
