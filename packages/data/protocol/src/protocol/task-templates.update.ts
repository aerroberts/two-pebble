import type { TaskTemplateRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplatesUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplatesUpdateOperation {
  name: 'updateTaskTemplate';
  request: { id: string; name?: string; prompt?: string };
  response: { template: TaskTemplateRecord };
}
