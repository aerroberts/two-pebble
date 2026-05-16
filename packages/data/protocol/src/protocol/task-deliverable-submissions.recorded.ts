import type { TaskDeliverableSubmissionRecord } from './task-deliverable-types';

/**
 * Defines the TaskDeliverableSubmissionRecordedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverableSubmissionRecordedEvent {
  name: 'taskDeliverableSubmissionRecorded';
  payload: TaskDeliverableSubmissionRecord;
}
