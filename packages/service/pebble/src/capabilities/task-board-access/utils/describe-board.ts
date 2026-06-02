import type { TaskBoardDependencyEdge, TaskBoardPoolNode, TaskBoardSnapshot, TaskBoardTaskNode } from '../../../agent';
import type { DependenciesBySource, PoolChildrenByParent, RenderPoolInput, TasksByPool } from './describe-board-types';

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

  for (const pool of rootPools) {
    renderPool({
      depsByFrom,
      isLast: true,
      out: lines,
      pool,
      poolsByParent: childPoolsByParent,
      prefix: '',
      tasksByPool,
    });
  }
  if (rootTasks.length > 0) {
    lines.push('└─ (root tasks)');
    for (let index = 0; index < rootTasks.length; index += 1) {
      const isLast = index === rootTasks.length - 1;
      lines.push(`   ${isLast ? '└─' : '├─'} ${formatTask(rootTasks[index] as TaskBoardTaskNode, depsByFrom)}`);
    }
  }
  return lines.join('\n');
}

function renderPool(input: RenderPoolInput): void {
  const connector = input.isLast ? '└─' : '├─';
  input.out.push(`${input.prefix}${connector} ${input.pool.name} [${input.pool.id}]`);
  const childPrefix = `${input.prefix}${input.isLast ? '   ' : '│  '}`;
  const childPools = (input.poolsByParent.get(input.pool.id) ?? []).sort(byName);
  const childTasks = (input.tasksByPool.get(input.pool.id) ?? []).sort(byName);
  for (let index = 0; index < childPools.length; index += 1) {
    const child = childPools[index] as TaskBoardPoolNode;
    const last = index === childPools.length - 1 && childTasks.length === 0;
    renderPool({ ...input, isLast: last, pool: child, prefix: childPrefix });
  }
  for (let index = 0; index < childTasks.length; index += 1) {
    const task = childTasks[index] as TaskBoardTaskNode;
    const last = index === childTasks.length - 1;
    input.out.push(`${childPrefix}${last ? '└─' : '├─'} ${formatTask(task, input.depsByFrom)}`);
  }
}

function formatTask(task: TaskBoardTaskNode, depsByFrom: DependenciesBySource): string {
  const deps = depsByFrom.get(task.id);
  const depsLabel = deps !== undefined && deps.length > 0 ? `, deps: ${deps.join(',')}` : '';
  return `${task.name} [${task.id}, ${task.effectiveStatus}${depsLabel}]`;
}

function indexDependencies(edges: TaskBoardDependencyEdge[]): DependenciesBySource {
  const map = new Map<string, string[]>();
  for (const edge of edges) {
    const existing = map.get(edge.fromId) ?? [];
    existing.push(edge.toId);
    map.set(edge.fromId, existing);
  }
  return map;
}

function indexChildPools(pools: TaskBoardPoolNode[]): PoolChildrenByParent {
  const map = new Map<string | null, TaskBoardPoolNode[]>();
  for (const pool of pools) {
    const key = pool.parentPoolId ?? null;
    const existing = map.get(key) ?? [];
    existing.push(pool);
    map.set(key, existing);
  }
  return map;
}

function indexTasksByPool(tasks: TaskBoardTaskNode[]): TasksByPool {
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

/**
 * Renders a flat list of task records as compact `id name [status, pool]`
 * lines the model can scan quickly. Sorted by name so the output is stable.
 */
export function renderTaskList(tasks: TaskBoardTaskNode[]): string {
  if (tasks.length === 0) {
    return '(no tasks)';
  }
  const sorted = [...tasks].sort(byName);
  return sorted
    .map((task) => {
      const poolLabel = task.poolId === null ? 'pool: (root)' : `pool: ${task.poolId}`;
      return `${task.id}  ${task.name} [${task.effectiveStatus}, ${poolLabel}]`;
    })
    .join('\n');
}
