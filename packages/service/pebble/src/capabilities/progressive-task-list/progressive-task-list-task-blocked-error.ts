export class ProgressiveTaskListTaskBlockedError extends Error {
  public constructor(taskId: string, dependencyId: string) {
    super(`Task ${taskId} is blocked by dependency ${dependencyId}.`);
  }
}
