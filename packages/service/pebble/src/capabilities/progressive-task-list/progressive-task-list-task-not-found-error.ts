export class ProgressiveTaskListTaskNotFoundError extends Error {
  public constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
  }
}
