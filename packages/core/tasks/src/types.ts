/**
 * Stored, user-controlled task state. The engine never writes these directly.
 * `pending` is the implicit starting state of a freshly-added task.
 *
 * Terminal states are `success`, `failure`, and `canceled`. `canceled` is a
 * user-initiated terminal state distinct from `failure` — a task the user
 * decided to stop pursuing rather than one that failed to complete.
 */
export type TaskStoredStatus = 'pending' | 'working' | 'waiting' | 'success' | 'failure' | 'canceled';

/**
 * The status callers see. `blocked` and `open` are derived from the dependency
 * graph; the rest mirror the stored intent of the task.
 */
export type TaskEffectiveStatus = 'blocked' | 'open' | 'working' | 'waiting' | 'success' | 'failure' | 'canceled';

/**
 * Subset of statuses an external caller is allowed to set. Blocked / open are
 * engine-derived and may not be supplied directly.
 */
export type SettableTaskStatus = 'working' | 'waiting' | 'success' | 'failure' | 'canceled';

export type EntityKind = 'task' | 'pool';

export interface TaskRecord {
  id: string;
  boardId: string;
  poolId: string | null;
  status: TaskStoredStatus;
}

export interface PoolRecord {
  id: string;
  boardId: string;
  parentPoolId: string | null;
}

export interface DependencyRecord {
  fromId: string;
  toId: string;
}

export interface AddTaskInput {
  id: string;
  poolId?: string;
  dependsOn?: string[];
}

export interface AddPoolInput {
  id: string;
  parentPoolId?: string;
  dependsOn?: string[];
}

export interface AddDependencyInput {
  fromId: string;
  toId: string;
}

export interface TaskStatusChangedEvent {
  type: 'task-status-changed';
  taskId: string;
  previous: TaskEffectiveStatus;
  next: TaskEffectiveStatus;
}

export type TaskBoardEvent = TaskStatusChangedEvent;
export type TaskBoardListener = (event: TaskBoardEvent) => void;
export type TaskBoardUnsubscribe = () => void;

export type ParentId = string | null;
export type EffectiveStatusMap = Map<string, TaskEffectiveStatus>;
