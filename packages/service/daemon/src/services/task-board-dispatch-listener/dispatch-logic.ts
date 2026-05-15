import type { TaskDispatchSettingsRecord, TaskPoolRecord } from '@two-pebble/datastore';
import type { DispatcherScope, DispatchTaskRecord } from './types';

export function canDispatch(settings: TaskDispatchSettingsRecord): boolean {
  return settings.dispatchMode === 'automatic' && settings.concurrency > 0 && settings.autoAgentRegistryId !== null;
}

export function countInProgress(tasks: DispatchTaskRecord[]): number {
  return tasks.filter(isInProgress).length;
}

export function isOpenable(task: DispatchTaskRecord): boolean {
  return task.effectiveStatus === 'open' && task.ownerId === null;
}

export function filterTasksInScope(
  scope: DispatcherScope,
  pools: TaskPoolRecord[],
  tasks: DispatchTaskRecord[],
): DispatchTaskRecord[] {
  if (scope.kind === 'board') {
    return tasks;
  }
  return collectPoolTasks(scope.id, pools, tasks);
}

export function ancestorsHaveSlots(
  task: DispatchTaskRecord,
  pools: TaskPoolRecord[],
  tasks: DispatchTaskRecord[],
  boardSettings: TaskDispatchSettingsRecord | null,
  poolSettings: Map<string, TaskDispatchSettingsRecord>,
): boolean {
  if (boardSettings !== null && boardSettings.concurrency > 0) {
    const boardInProgress = countInProgress(tasks);
    if (boardInProgress >= boardSettings.concurrency) {
      return false;
    }
  }
  let cursor: string | null = task.poolId;
  while (cursor !== null) {
    const settings = poolSettings.get(cursor);
    if (settings !== undefined && settings.concurrency > 0) {
      const poolTasks = collectPoolTasks(cursor, pools, tasks);
      const poolInProgress = countInProgress(poolTasks);
      if (poolInProgress >= settings.concurrency) {
        return false;
      }
    }
    const pool = pools.find((entry) => entry.id === cursor);
    cursor = pool?.parentPoolId ?? null;
  }
  return true;
}

export function orderTasksByDispatchPriority(tasks: DispatchTaskRecord[]): DispatchTaskRecord[] {
  return [...tasks].sort((a, b) => a.createdAt - b.createdAt);
}

function isInProgress(task: DispatchTaskRecord): boolean {
  return task.status === 'working' || task.status === 'waiting';
}

function collectPoolTasks(
  rootPoolId: string,
  pools: TaskPoolRecord[],
  tasks: DispatchTaskRecord[],
): DispatchTaskRecord[] {
  const descendants = new Set<string>([rootPoolId]);
  let added = true;
  while (added) {
    added = false;
    for (const pool of pools) {
      if (pool.parentPoolId !== null && descendants.has(pool.parentPoolId) && !descendants.has(pool.id)) {
        descendants.add(pool.id);
        added = true;
      }
    }
  }
  return tasks.filter((task) => task.poolId !== null && descendants.has(task.poolId));
}
