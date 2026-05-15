import type { TaskDeliverablePayload, TaskDeliverableSubmissionRecord } from './task-deliverable-types';

export interface TaskDeliverableSubmissionsSubmitOperation {
  name: 'submitTaskDeliverable';
  request: { agentId: string; taskId: string; deliverableId: string; payload: TaskDeliverablePayload };
  response: { submission: TaskDeliverableSubmissionRecord };
}
