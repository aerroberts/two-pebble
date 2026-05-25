import type { TaskStatus } from './types';

/**
 * Error thrown when a task mutation targets a terminal task.
 * The current status is included so callers can explain why the
 * operation was rejected.
 */
export class ProgressiveTaskListTaskAlreadyTerminalError extends Error {
  public constructor(taskId: string, status: TaskStatus) {
    super(`Task ${taskId} is already terminal (${status}).`);
  }
}
