/**
 * Recorded when a task's owning agent is cleared.
 * Preserves which agent the task was previously assigned to so the event log
 * stays a meaningful audit trail after the link is broken.
 */
export interface TaskUndelegatedEvent {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  kind: 'undelegated';
  reason: string;
  agentId: string;
}
