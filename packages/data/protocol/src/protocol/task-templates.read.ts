import type { TaskTemplateRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplatesReadOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplatesReadOperation {
  name: 'readTaskTemplate';
  request: { id: string };
  response: { template: TaskTemplateRecord };
}
