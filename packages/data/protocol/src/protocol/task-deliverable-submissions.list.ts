import type { TaskDeliverableSubmissionRecord } from './task-deliverable-types';

/**
 * Defines the TaskDeliverableSubmissionsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverableSubmissionsListOperation {
  name: 'listTaskDeliverableSubmissions';
  request: { taskId: string };
  response: { items: TaskDeliverableSubmissionRecord[] };
}
