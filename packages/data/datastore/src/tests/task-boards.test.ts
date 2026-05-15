import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';
import {
  createPendingTask,
  recordStatusTaskEvent,
  recordTwoTaskEvents,
  seedBoardWithOneTask,
  seedBoardWithPoolAndTask,
  seedBoardWithTwoPools,
  seedTwoTasks,
  upsertBoardDispatchSettings,
  upsertPoolDispatchSettings,
} from '../testing/task-boards-test-env';

describe('feature: operation task-boards.create', () => {
  test('happy: create returns the persisted board', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'Roadmap' });
    await datastore.close();
    expect(board.name).toBe('Roadmap');
  });
});

describe('feature: operation task-boards.list', () => {
  test('happy: list returns all boards', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.taskBoards.create({ name: 'A' });
    await datastore.taskBoards.create({ name: 'B' });
    const boards = await datastore.taskBoards.list({});
    await datastore.close();
    expect(boards.items.map((board) => board.name)).toEqual(['A', 'B']);
  });
});

describe('feature: operation task-boards.read', () => {
  test('happy: read returns the matching board', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.taskBoards.create({ name: 'A' });
    const read = await datastore.taskBoards.read({ id: created.id });
    await datastore.close();
    expect(read.id).toBe(created.id);
  });
});

describe('feature: operation task-boards.update', () => {
  test('happy: update renames the board', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'Old' });
    const updated = await datastore.taskBoards.update({ id: board.id, name: 'New' });
    await datastore.close();
    expect(updated.name).toBe('New');
  });
});

describe('feature: operation task-boards.delete', () => {
  test('happy: delete removes the board and cascading rows', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'A' });
    await datastore.taskBoards.delete({ id: board.id });
    const remaining = await datastore.taskBoards.list({});
    await datastore.close();
    expect(remaining.items).toEqual([]);
  });
});

describe('feature: operation task-pools.create', () => {
  test('happy: pool persists with parent and board', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'A' });
    const pool = await datastore.taskBoards.pools.create({ boardId: board.id, parentPoolId: null, name: 'P' });
    await datastore.close();
    expect(pool.boardId).toBe(board.id);
  });
});

describe('feature: operation task-pools.list', () => {
  test('happy: list returns pools for the board', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'A' });
    await datastore.taskBoards.pools.create({ boardId: board.id, parentPoolId: null, name: 'P' });
    const pools = await datastore.taskBoards.pools.list({ boardId: board.id });
    await datastore.close();
    expect(pools.items.length).toBe(1);
  });
});

describe('feature: operation task-pools.delete', () => {
  test('happy: delete removes the pool', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'A' });
    const pool = await datastore.taskBoards.pools.create({ boardId: board.id, parentPoolId: null, name: 'P' });
    await datastore.taskBoards.pools.delete({ id: pool.id });
    const pools = await datastore.taskBoards.pools.list({ boardId: board.id });
    await datastore.close();
    expect(pools.items).toEqual([]);
  });
});

describe('feature: operation task-pools.set-parent', () => {
  test('happy: setParent moves a pool under a parent pool', async () => {
    const datastore = await useDatastoreForTesting();
    const { childPoolId, parentPoolId } = await seedBoardWithTwoPools(datastore);
    const pool = await datastore.taskBoards.pools.setParent({ id: childPoolId, parentPoolId });
    await datastore.close();
    expect(pool.parentPoolId).toBe(parentPoolId);
  });
});

describe('feature: operation tasks.create', () => {
  test('happy: task persists with status and pool', async () => {
    const datastore = await useDatastoreForTesting();
    const task = await createPendingTask(datastore);
    await datastore.close();
    expect(task.status).toBe('pending');
  });
});

describe('feature: operation tasks.list', () => {
  test('happy: list returns tasks for the board', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'A' });
    await datastore.taskBoards.tasks.create({ boardId: board.id, poolId: null, name: 'T', status: 'pending' });
    const tasks = await datastore.taskBoards.tasks.list({ boardId: board.id });
    await datastore.close();
    expect(tasks.items.length).toBe(1);
  });
});

describe('feature: operation tasks.update', () => {
  test('happy: update changes status', async () => {
    const datastore = await useDatastoreForTesting();
    const { taskId } = await seedBoardWithOneTask(datastore);
    const updated = await datastore.taskBoards.tasks.update({ id: taskId, status: 'working' });
    await datastore.close();
    expect(updated.status).toBe('working');
  });

  test('happy: update stamps template metadata', async () => {
    const datastore = await useDatastoreForTesting();
    const { taskId } = await seedBoardWithOneTask(datastore);
    const updated = await datastore.taskBoards.tasks.update({
      id: taskId,
      templateId: 'template-1',
      additionalContext: 'Extra instructions',
    });
    await datastore.close();
    expect(updated.templateId).toBe('template-1');
    expect(updated.additionalContext).toBe('Extra instructions');
  });
});

describe('feature: operation task-templates', () => {
  test('happy: template and deliverables persist for a board', async () => {
    const datastore = await useDatastoreForTesting();
    const board = await datastore.taskBoards.create({ name: 'A' });
    const template = await datastore.taskBoards.templates.create({
      boardId: board.id,
      name: 'Bug fix',
      prompt: 'Include reproduction steps.',
    });
    await datastore.taskBoards.templates.deliverables.create({
      templateId: template.id,
      name: 'Summary',
      type: 'text',
      orderIndex: 0,
    });
    const templates = await datastore.taskBoards.templates.list({ boardId: board.id });
    const deliverables = await datastore.taskBoards.templates.deliverables.list({ templateId: template.id });
    await datastore.close();
    expect(templates.items.map((item) => item.name)).toEqual(['Bug fix']);
    expect(deliverables.items.map((item) => item.name)).toEqual(['Summary']);
  });
});

describe('feature: operation task-deliverable-submissions.upsert', () => {
  test('happy: upsert replaces payload for one task deliverable', async () => {
    const datastore = await useDatastoreForTesting();
    const { taskId } = await seedBoardWithOneTask(datastore);
    const deliverable = await datastore.taskBoards.deliverables.create({
      taskId,
      name: 'PR',
      type: 'pr_url',
      orderIndex: 0,
    });
    await datastore.taskBoards.deliverableSubmissions.upsert({
      taskId,
      deliverableId: deliverable.id,
      payload: JSON.stringify({ type: 'pr_url', url: 'https://example.com/one' }),
      submittedAt: 1,
    });
    await datastore.taskBoards.deliverableSubmissions.upsert({
      taskId,
      deliverableId: deliverable.id,
      payload: JSON.stringify({ type: 'pr_url', url: 'https://example.com/two' }),
      submittedAt: 2,
    });
    const submissions = await datastore.taskBoards.deliverableSubmissions.list({ taskId });
    await datastore.close();
    expect(submissions.items.length).toBe(1);
    expect(JSON.parse(submissions.items[0]?.payload ?? '{}')).toEqual({
      type: 'pr_url',
      url: 'https://example.com/two',
    });
    expect(submissions.items[0]?.submittedAt).toBe(2);
  });
});

describe('feature: operation tasks.rename', () => {
  test('happy: rename changes the task name', async () => {
    const datastore = await useDatastoreForTesting();
    const { taskId } = await seedBoardWithOneTask(datastore);
    const updated = await datastore.taskBoards.tasks.rename({ id: taskId, name: 'Renamed' });
    await datastore.close();
    expect(updated.name).toBe('Renamed');
  });
});

describe('feature: operation tasks.update-description', () => {
  test('happy: updateDescription changes the task description', async () => {
    const datastore = await useDatastoreForTesting();
    const { taskId } = await seedBoardWithOneTask(datastore);
    const updated = await datastore.taskBoards.tasks.updateDescription({ id: taskId, description: 'New body' });
    await datastore.close();
    expect(updated.description).toBe('New body');
  });
});

describe('feature: operation tasks.set-owner', () => {
  test('happy: setOwner sets the ownerId', async () => {
    const datastore = await useDatastoreForTesting();
    const { taskId } = await seedBoardWithOneTask(datastore);
    const owned = await datastore.taskBoards.tasks.setOwner({ id: taskId, ownerId: 'agent-1' });
    await datastore.close();
    expect(owned.ownerId).toBe('agent-1');
  });
});

describe('feature: operation tasks.set-pool', () => {
  test('happy: setPool moves a task into a pool', async () => {
    const datastore = await useDatastoreForTesting();
    const { poolId, taskId } = await seedBoardWithPoolAndTask(datastore);
    const task = await datastore.taskBoards.tasks.setPool({ id: taskId, poolId });
    await datastore.close();
    expect(task.poolId).toBe(poolId);
  });
});

describe('feature: operation tasks.delete', () => {
  test('happy: delete removes the task', async () => {
    const datastore = await useDatastoreForTesting();
    const { boardId, taskId } = await seedBoardWithOneTask(datastore);
    await datastore.taskBoards.tasks.delete({ id: taskId });
    const tasks = await datastore.taskBoards.tasks.list({ boardId });
    await datastore.close();
    expect(tasks.items).toEqual([]);
  });
});

describe('feature: operation task-dependencies.create', () => {
  test('happy: dependency persists for board', async () => {
    const datastore = await useDatastoreForTesting();
    const { boardId, fromId, toId } = await seedTwoTasks(datastore);
    const edge = await datastore.taskBoards.dependencies.create({ boardId, fromId, toId });
    await datastore.close();
    expect(edge.fromId).toBe(fromId);
  });
});

describe('feature: operation task-dependencies.list', () => {
  test('happy: list returns dependencies for the board', async () => {
    const datastore = await useDatastoreForTesting();
    const { boardId, fromId, toId } = await seedTwoTasks(datastore);
    await datastore.taskBoards.dependencies.create({ boardId, fromId, toId });
    const deps = await datastore.taskBoards.dependencies.list({ boardId });
    await datastore.close();
    expect(deps.items.length).toBe(1);
  });
});

describe('feature: operation task-dependencies.delete', () => {
  test('happy: delete removes the dependency edge', async () => {
    const datastore = await useDatastoreForTesting();
    const { boardId, fromId, toId } = await seedTwoTasks(datastore);
    await datastore.taskBoards.dependencies.create({ boardId, fromId, toId });
    await datastore.taskBoards.dependencies.delete({ fromId, toId });
    const deps = await datastore.taskBoards.dependencies.list({ boardId });
    await datastore.close();
    expect(deps.items).toEqual([]);
  });
});

describe('feature: operation task-events.record', () => {
  test('happy: record persists a status event with reason', async () => {
    const datastore = await useDatastoreForTesting();
    const event = await recordStatusTaskEvent(datastore);
    await datastore.close();
    expect(event).toMatchObject({ status: 'working', reason: 'manual' });
  });
});

describe('feature: operation task-events.list', () => {
  test('happy: list returns events for a task in chronological order', async () => {
    const datastore = await useDatastoreForTesting();
    const events = await recordTwoTaskEvents(datastore);
    await datastore.close();
    expect(events.items.map((event) => event.reason)).toEqual(['first', 'second']);
  });
});

describe('feature: operation task-dispatch-settings.upsert', () => {
  test('happy: upserts board dispatch settings', async () => {
    const datastore = await useDatastoreForTesting();
    const settings = await upsertBoardDispatchSettings(datastore);
    await datastore.close();
    expect(settings.concurrency).toBe(3);
  });
});

describe('feature: operation task-dispatch-settings.read', () => {
  test('happy: reads dispatch settings by scope', async () => {
    const datastore = await useDatastoreForTesting();
    await upsertPoolDispatchSettings(datastore);
    const settings = await datastore.taskBoards.dispatchSettings.read({ scopeId: 'pool-1', scopeKind: 'pool' });
    await datastore.close();
    expect(settings?.dispatchMode).toBe('manual');
  });
});

describe('feature: operation task-dispatch-settings.list', () => {
  test('happy: lists dispatch settings', async () => {
    const datastore = await useDatastoreForTesting();
    await upsertBoardDispatchSettings(datastore);
    const list = await datastore.taskBoards.dispatchSettings.list({});
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation task-dispatch-settings.delete', () => {
  test('happy: deletes dispatch settings by scope', async () => {
    const datastore = await useDatastoreForTesting();
    await upsertBoardDispatchSettings(datastore);
    await datastore.taskBoards.dispatchSettings.delete({ scopeId: 'board-1', scopeKind: 'board' });
    const list = await datastore.taskBoards.dispatchSettings.list({});
    await datastore.close();
    expect(list.items).toHaveLength(0);
  });
});
