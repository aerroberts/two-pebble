import type { TaskDeliverableSubmissionRecord } from './task-deliverable-types';

export interface TaskDeliverableSubmissionRecordedEvent {
  name: 'taskDeliverableSubmissionRecorded';
  payload: TaskDeliverableSubmissionRecord;
}
