/**
 * Recorded when a user (via CLI or UI) leaves a comment on a task.
 * Comments share the task event stream so they render inline in the
 * task activity log; the comment text lives in `reason`.
 */
export interface TaskCommentEvent {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  kind: 'comment';
  reason: string;
}
