import type { TaskDeliverablePayload, TaskDeliverableSubmissionRecord } from './task-deliverable-types';

/**
 * Defines the TaskDeliverableSubmissionsSubmitOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverableSubmissionsSubmitOperation {
  name: 'submitTaskDeliverable';
  request: { taskId: string; deliverableId: string; payload: TaskDeliverablePayload };
  response: { submission: TaskDeliverableSubmissionRecord };
}
