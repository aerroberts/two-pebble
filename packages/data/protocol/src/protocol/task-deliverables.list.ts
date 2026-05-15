import type { TaskDeliverableRecord } from './task-deliverable-types';

export interface TaskDeliverablesListOperation {
  name: 'listTaskDeliverables';
  request: { taskId: string };
  response: { items: TaskDeliverableRecord[] };
}
