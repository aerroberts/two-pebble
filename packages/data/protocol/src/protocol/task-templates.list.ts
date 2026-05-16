import type { TaskTemplateRecord } from './task-deliverable-types';

/**
 * Defines the TaskTemplatesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplatesListOperation {
  name: 'listTaskTemplates';
  request: { boardId: string };
  response: { items: TaskTemplateRecord[] };
}
