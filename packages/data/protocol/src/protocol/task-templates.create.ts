import type { TaskTemplateRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplatesCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplatesCreateOperation {
  name: 'createTaskTemplate';
  request: { boardId: string; name: string; prompt?: string };
  response: { template: TaskTemplateRecord };
}
