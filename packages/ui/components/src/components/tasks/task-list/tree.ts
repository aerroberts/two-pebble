import type { ReactNode } from 'react';
import type { TaskStatusIconStatus } from '../task-status-icon/types';
import type { TaskListPool, TaskListTask } from './task-list';

export type TaskListNode = TaskListTaskNode | TaskListPoolNode;

export interface TaskListTaskNode {
  id: string;
  kind: 'task';
  name: string;
  status: TaskStatusIconStatus;
  /** Forwarded from {@link TaskListTask.concurrencyIndicator}. */
  concurrencyIndicator: ReactNode;
}

export interface TaskListPoolNode {
  id: string;
  kind: 'pool';
  name: string;
  children: TaskListNode[];
}

export function buildTaskListTree(tasks: TaskListTask[], pools: TaskListPool[]): TaskListNode[] {
  const tasksByPool = groupTasksByPool(tasks);
  const poolsByParent = groupPoolsByParent(pools);
  return buildLevel(null, tasksByPool, poolsByParent);
}

function groupTasksByPool(tasks: TaskListTask[]): Map<string | null, TaskListTask[]> {
  const map = new Map<string | null, TaskListTask[]>();
  for (const task of tasks) {
    const list = map.get(task.poolId) ?? [];
    list.push(task);
    map.set(task.poolId, list);
  }
  return map;
}

function groupPoolsByParent(pools: TaskListPool[]): Map<string | null, TaskListPool[]> {
  const map = new Map<string | null, TaskListPool[]>();
  for (const pool of pools) {
    const list = map.get(pool.parentPoolId) ?? [];
    list.push(pool);
    map.set(pool.parentPoolId, list);
  }
  return map;
}

function buildLevel(
  parentId: string | null,
  tasksByPool: Map<string | null, TaskListTask[]>,
  poolsByParent: Map<string | null, TaskListPool[]>,
): TaskListNode[] {
  const nodes: TaskListNode[] = [];
  for (const pool of poolsByParent.get(parentId) ?? []) {
    nodes.push({
      id: pool.id,
      kind: 'pool',
      name: pool.name,
      children: buildLevel(pool.id, tasksByPool, poolsByParent),
    });
  }
  for (const task of tasksByPool.get(parentId) ?? []) {
    nodes.push({
      id: task.id,
      kind: 'task',
      name: task.name,
      status: task.status,
      concurrencyIndicator: task.concurrencyIndicator ?? null,
    });
  }
  return nodes;
}
