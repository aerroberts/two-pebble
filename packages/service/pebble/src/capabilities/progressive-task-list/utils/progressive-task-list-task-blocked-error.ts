/**
 * Error thrown when a task cannot complete because its dependency is open.
 * The message is model-facing so the agent can correct the attempted
 * task transition.
 */
export class ProgressiveTaskListTaskBlockedError extends Error {
  public constructor(taskId: string, dependencyId: string) {
    super(`Task ${taskId} is blocked by dependency ${dependencyId}.`);
  }
}
