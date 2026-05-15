import type { TaskDeliverableSubmissionRecord } from './task-deliverable-types';

export interface TaskDeliverableSubmissionsListOperation {
  name: 'listTaskDeliverableSubmissions';
  request: { taskId: string };
  response: { items: TaskDeliverableSubmissionRecord[] };
}
