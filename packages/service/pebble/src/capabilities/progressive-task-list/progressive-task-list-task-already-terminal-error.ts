import type { TaskStatus } from './types';

export class ProgressiveTaskListTaskAlreadyTerminalError extends Error {
  public constructor(taskId: string, status: TaskStatus) {
    super(`Task ${taskId} is already terminal (${status}).`);
  }
}
