/**
 * Thrown when an agent attempts to mutate a task it does not own.
 * Holds the task id, the agent id that attempted the mutation, and the
 * actual owner so observers can render precise messages.
 */
export class TaskOwnershipError extends Error {
  public readonly taskId: string;
  public readonly callerAgentId: string;
  public readonly ownerAgentId: string | null;

  /**
   * Builds a TaskOwnershipError annotated with both sides of the mismatch.
   * `ownerAgentId` is null when the task is unowned and a non-owner agent
   * tried to mutate it anyway.
   */
  public constructor(taskId: string, callerAgentId: string, ownerAgentId: string | null) {
    const ownerLabel = ownerAgentId === null ? 'no owner' : `"${ownerAgentId}"`;
    super(`agent "${callerAgentId}" cannot mutate task "${taskId}" owned by ${ownerLabel}`);
    this.taskId = taskId;
    this.callerAgentId = callerAgentId;
    this.ownerAgentId = ownerAgentId;
    this.name = 'TaskOwnershipError';
  }
}
