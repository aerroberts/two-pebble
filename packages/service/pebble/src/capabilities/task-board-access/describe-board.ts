import type { TaskBoardDependencyEdge, TaskBoardPoolNode, TaskBoardSnapshot, TaskBoardTaskNode } from '../../agent';

/**
 * Renders the board snapshot as an indented tree the model can scan in
 * one pass: pool branches expanded under their parents, root-level tasks
 * grouped under "(root)", and each task line carries id, effective
 * status, and forward dependency ids. Designed for compact output —
 * sub-tasks read like file paths.
 */
export function renderBoardTree(snapshot: TaskBoardSnapshot): string {
  const lines: string[] = [];
  lines.push(`board: ${snapshot.boardName} [${snapshot.boardId}]`);
  const depsByFrom = indexDependencies(snapshot.dependencies);
  const childPoolsByParent = indexChildPools(snapshot.pools);
  const tasksByPool = indexTasksByPool(snapshot.tasks);

  const rootPools = (childPoolsByParent.get(null) ?? []).sort(byName);
  const rootTasks = (tasksByPool.get(null) ?? []).sort(byName);

  for (const pool of rootPools) renderPool(pool, '', true, lines, childPoolsByParent, tasksByPool, depsByFrom);
  if (rootTasks.length > 0) {
    lines.push('└─ (root tasks)');
    for (let index = 0; index < rootTasks.length; index += 1) {
      const isLast = index === rootTasks.length - 1;
      lines.push(`   ${isLast ? '└─' : '├─'} ${formatTask(rootTasks[index] as TaskBoardTaskNode, depsByFrom)}`);
    }
  }
  return lines.join('\n');
}

function renderPool(
  pool: TaskBoardPoolNode,
  prefix: string,
  isLast: boolean,
  out: string[],
  poolsByParent: Map<string | null, TaskBoardPoolNode[]>,
  tasksByPool: Map<string | null, TaskBoardTaskNode[]>,
  depsByFrom: Map<string, string[]>,
): void {
  const connector = isLast ? '└─' : '├─';
  out.push(`${prefix}${connector} ${pool.name} [${pool.id}]`);
  const childPrefix = `${prefix}${isLast ? '   ' : '│  '}`;
  const childPools = (poolsByParent.get(pool.id) ?? []).sort(byName);
  const childTasks = (tasksByPool.get(pool.id) ?? []).sort(byName);
  for (let index = 0; index < childPools.length; index += 1) {
    const child = childPools[index] as TaskBoardPoolNode;
    const last = index === childPools.length - 1 && childTasks.length === 0;
    renderPool(child, childPrefix, last, out, poolsByParent, tasksByPool, depsByFrom);
  }
  for (let index = 0; index < childTasks.length; index += 1) {
    const task = childTasks[index] as TaskBoardTaskNode;
    const last = index === childTasks.length - 1;
    out.push(`${childPrefix}${last ? '└─' : '├─'} ${formatTask(task, depsByFrom)}`);
  }
}

function formatTask(task: TaskBoardTaskNode, depsByFrom: Map<string, string[]>): string {
  const deps = depsByFrom.get(task.id);
  const depsLabel = deps !== undefined && deps.length > 0 ? `, deps: ${deps.join(',')}` : '';
  const ownerLabel = task.ownerId !== null ? `, owner: ${task.ownerId}` : '';
  return `${task.name} [${task.id}, ${task.effectiveStatus}${depsLabel}${ownerLabel}]`;
}

function indexDependencies(edges: TaskBoardDependencyEdge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const edge of edges) {
    const existing = map.get(edge.fromId) ?? [];
    existing.push(edge.toId);
    map.set(edge.fromId, existing);
  }
  return map;
}

function indexChildPools(pools: TaskBoardPoolNode[]): Map<string | null, TaskBoardPoolNode[]> {
  const map = new Map<string | null, TaskBoardPoolNode[]>();
  for (const pool of pools) {
    const key = pool.parentPoolId ?? null;
    const existing = map.get(key) ?? [];
    existing.push(pool);
    map.set(key, existing);
  }
  return map;
}

function indexTasksByPool(tasks: TaskBoardTaskNode[]): Map<string | null, TaskBoardTaskNode[]> {
  const map = new Map<string | null, TaskBoardTaskNode[]>();
  for (const task of tasks) {
    const key = task.poolId ?? null;
    const existing = map.get(key) ?? [];
    existing.push(task);
    map.set(key, existing);
  }
  return map;
}

function byName<T extends { name: string }>(left: T, right: T): number {
  return left.name.localeCompare(right.name);
}
