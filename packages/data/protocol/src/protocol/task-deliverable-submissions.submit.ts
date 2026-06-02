import type { TaskDeliverablePayload, TaskDeliverableSubmissionRecord } from './task-deliverable-types';
import type { TrackedPrRecord } from './tracked-prs.recorded';

/**
 * Defines the TaskDeliverableSubmissionsSubmitOperation protocol contract for daemon bridge messages.
 * A `text` deliverable records a submission immediately. A `pr_url` deliverable
 * attaches a GitHub PR for the daemon to track (attach-then-watch) and returns
 * the tracked PR; its submission is only recorded once the PR merges.
 */
export interface TaskDeliverableSubmissionsSubmitOperation {
  name: 'submitTaskDeliverable';
  request: { taskId: string; deliverableId: string; payload: TaskDeliverablePayload };
  response: { submission: TaskDeliverableSubmissionRecord } | { trackedPr: TrackedPrRecord };
}
