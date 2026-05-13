import type { Datastore } from '../datastore';

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
