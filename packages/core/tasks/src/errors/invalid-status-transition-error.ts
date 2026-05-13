import type { SettableTaskStatus, TaskEffectiveStatus } from '../types';

/**
 * Thrown when a status transition request is rejected by the engine.
 * Holds the task id, current effective status, and requested next status so
 * observers can render a precise message and surface the reason for the deny.
 */
export class InvalidStatusTransitionError extends Error {
  public readonly current: TaskEffectiveStatus;
  public readonly requested: SettableTaskStatus;
  public readonly taskId: string;

  /**
   * Builds an InvalidStatusTransitionError annotated with the offending transition.
   * Carries enough context for telemetry and human-readable messages.
   * Terminal-to-anything is the most common rejection reason.
   */
  public constructor(taskId: string, current: TaskEffectiveStatus, requested: SettableTaskStatus) {
    super(`task "${taskId}" cannot transition from "${current}" to "${requested}"`);
    this.taskId = taskId;
    this.current = current;
    this.requested = requested;
    this.name = 'InvalidStatusTransitionError';
  }
}
