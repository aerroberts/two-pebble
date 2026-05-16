import type { Datastore } from '../datastore';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function seedBoardWithOneTask(datastore: Datastore) {
  const board = await datastore.taskBoards.create({ name: 'A' });
  const task = await datastore.taskBoards.tasks.create({
    boardId: board.id,
    poolId: null,
    name: 'T',
    status: 'pending',
  });
  return { boardId: board.id, taskId: task.id };
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function seedTwoTasks(datastore: Datastore) {
  const { boardId, taskId: fromId } = await seedBoardWithOneTask(datastore);
  const toTask = await datastore.taskBoards.tasks.create({
    boardId,
    poolId: null,
    name: 'B',
    status: 'pending',
  });
  return { boardId, fromId, toId: toTask.id };
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function seedBoardWithTwoPools(datastore: Datastore) {
  const board = await datastore.taskBoards.create({ name: 'A' });
  const parent = await datastore.taskBoards.pools.create({ boardId: board.id, parentPoolId: null, name: 'Parent' });
  const child = await datastore.taskBoards.pools.create({ boardId: board.id, parentPoolId: null, name: 'Child' });
  return { boardId: board.id, parentPoolId: parent.id, childPoolId: child.id };
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function seedBoardWithPoolAndTask(datastore: Datastore) {
  const board = await datastore.taskBoards.create({ name: 'A' });
  const pool = await datastore.taskBoards.pools.create({ boardId: board.id, parentPoolId: null, name: 'P' });
  const task = await datastore.taskBoards.tasks.create({
    boardId: board.id,
    poolId: null,
    name: 'T',
    status: 'pending',
  });
  return { boardId: board.id, poolId: pool.id, taskId: task.id };
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function recordTwoTaskEvents(datastore: Datastore) {
  const { taskId } = await seedBoardWithOneTask(datastore);
  await datastore.taskBoards.events.record({ taskId, kind: 'status', status: 'working', reason: 'first', data: '{}' });
  await datastore.taskBoards.events.record({ taskId, kind: 'status', status: 'success', reason: 'second', data: '{}' });
  return datastore.taskBoards.events.list({ taskId });
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function createPendingTask(datastore: Datastore) {
  const board = await datastore.taskBoards.create({ name: 'A' });
  return datastore.taskBoards.tasks.create({
    boardId: board.id,
    poolId: null,
    name: 'T',
    status: 'pending',
  });
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function recordStatusTaskEvent(datastore: Datastore) {
  const { taskId } = await seedBoardWithOneTask(datastore);
  return datastore.taskBoards.events.record({
    taskId,
    kind: 'status',
    status: 'working',
    reason: 'manual',
    data: '{}',
  });
}
