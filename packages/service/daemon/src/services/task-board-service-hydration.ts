import type { Datastore, TaskDependencyRecord } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import { TaskBoard } from '@two-pebble/tasks';
import type { DatastoreTaskRow, PoolReplayRow } from './task-board-service-types';

interface HydrateTaskBoardInput {
  boardId: string;
  datastore: Datastore;
  logger: Logger;
}

export async function hydrateTaskBoard(input: HydrateTaskBoardInput): Promise<TaskBoard> {
  const engine = new TaskBoard(input.boardId);
  const pools = await input.datastore.taskBoards.pools.list({ boardId: input.boardId });
  const tasks = await input.datastore.taskBoards.tasks.list({ boardId: input.boardId });
  const dependencies = await input.datastore.taskBoards.dependencies.list({ boardId: input.boardId });
  replayPools({ datastore: input.datastore, engine, logger: input.logger, pools: pools.items });
  replayTasks({ datastore: input.datastore, engine, logger: input.logger, tasks: tasks.items });
  replayDependencies(engine, dependencies.items);
  return engine;
}

interface ReplayPoolsInput {
  datastore: Datastore;
  engine: TaskBoard;
  logger: Logger;
  pools: PoolReplayRow[];
}

function replayPools(input: ReplayPoolsInput): void {
  const knownIds = new Set(input.pools.map((pool) => pool.id));
  const pending = [...input.pools];
  while (pending.length > 0) {
    const before = pending.length;
    for (let index = pending.length - 1; index >= 0; index -= 1) {
      const pool = pending[index];
      if (pool === undefined) continue;
      const parent = pool.parentPoolId;
      if (parent === null || input.engine.listPools().some((existing) => existing.id === parent)) {
        input.engine.addPool({ id: pool.id, parentPoolId: parent ?? undefined });
        pending.splice(index, 1);
      }
    }
    if (pending.length !== before) continue;
    const orphan = pending.find((pool) => pool.parentPoolId !== null && !knownIds.has(pool.parentPoolId));
    if (orphan === undefined) throw new Error('cyclic pool parents in datastore');
    input.logger.warn('pool references missing parent — moving to board root', {
      poolId: orphan.id,
      parentPoolId: orphan.parentPoolId,
    });
    void input.datastore.taskBoards.pools.setParent({ id: orphan.id, parentPoolId: null }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      input.logger.warn('failed to persist orphaned-parent repair', { poolId: orphan.id, error: message });
    });
    orphan.parentPoolId = null;
  }
}

interface ReplayTasksInput {
  datastore: Datastore;
  engine: TaskBoard;
  logger: Logger;
  tasks: DatastoreTaskRow[];
}

function replayTasks(input: ReplayTasksInput): void {
  const validPoolIds = new Set(input.engine.listPools().map((pool) => pool.id));
  for (const task of input.tasks) {
    let poolId = task.poolId;
    if (poolId !== null && !validPoolIds.has(poolId)) {
      input.logger.warn('task references missing pool — moving to board root', {
        taskId: task.id,
        poolId,
      });
      void input.datastore.taskBoards.tasks.setPool({ id: task.id, poolId: null }).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        input.logger.warn('failed to persist orphaned-pool repair', { taskId: task.id, error: message });
      });
      poolId = null;
    }
    input.engine.addTask({ id: task.id, poolId: poolId ?? undefined });
    const stored = task.status;
    if (stored === 'working' || stored === 'waiting' || stored === 'success' || stored === 'failure') {
      input.engine.setTaskStatus(task.id, stored);
    }
  }
}

function replayDependencies(engine: TaskBoard, deps: TaskDependencyRecord[]): void {
  for (const edge of deps) engine.addDependency({ fromId: edge.fromId, toId: edge.toId });
}
