import type { TaskDeliverableRecord } from './task-deliverable-types';

/**
 * Defines the TaskDeliverablesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverablesListOperation {
  name: 'listTaskDeliverables';
  request: { taskId: string };
  response: { items: TaskDeliverableRecord[] };
}
