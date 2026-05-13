/**
 * Error thrown when a capability tool references an unknown task id.
 * The strict failure protects dependency checks and avoids silently
 * mutating the wrong task.
 */
export class ProgressiveTaskListTaskNotFoundError extends Error {
  public constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
  }
}
