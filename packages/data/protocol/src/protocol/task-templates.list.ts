import type { TaskTemplateRecord } from './task-deliverable-types';

export interface TaskTemplatesListOperation {
  name: 'listTaskTemplates';
  request: { boardId: string };
  response: { items: TaskTemplateRecord[] };
}
