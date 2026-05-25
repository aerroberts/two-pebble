import type { TaskListUpdateChange, TaskListUpdateStatus, TaskListUpdateTask } from '../traces';

export interface RawTodo {
  description: string;
  status: TaskListUpdateStatus;
}

/**
 * Builds a `task-list-update` payload from a fresh snapshot of todos and the
 * previously-emitted snapshot. IDs are derived from the description so the
 * same task keeps the same id across snapshots even when other entries are
 * reordered. Duplicate descriptions are disambiguated with a positional
 * suffix.
 *
 * `changes` contains only entries whose status actually transitioned, plus
 * net-new tasks (where `oldStatus` is `null`). When the snapshot is the
 * very first one, every task is reported as `oldStatus: null`.
 */
export function diffTaskList(
  previous: TaskListUpdateTask[],
  todos: RawTodo[],
): { tasks: TaskListUpdateTask[]; changes: TaskListUpdateChange[] } {
  const tasks: TaskListUpdateTask[] = [];
  const changes: TaskListUpdateChange[] = [];
  const usedIds = new Set<string>();
  const previousById = new Map(previous.map((task) => [task.id, task]));

  for (const todo of todos) {
    const id = nextUniqueId(todo.description, usedIds);
    usedIds.add(id);
    tasks.push({ id, description: todo.description, status: todo.status });
    const prior = previousById.get(id);
    if (prior === undefined) {
      changes.push({ id, oldStatus: null, newStatus: todo.status });
      continue;
    }
    if (prior.status !== todo.status) {
      changes.push({ id, oldStatus: prior.status, newStatus: todo.status });
    }
  }

  return { tasks, changes };
}

function nextUniqueId(description: string, used: Set<string>): string {
  const base = slugify(description);
  if (!used.has(base)) {
    return base;
  }
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!used.has(candidate)) {
      return candidate;
    }
  }
}

function slugify(description: string): string {
  const slug = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'todo';
}
