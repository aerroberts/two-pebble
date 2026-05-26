import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DAEMON_URL } from '../consts';

interface BoardCreateOptions {
  name: string;
}

interface PoolCreateOptions {
  name: string;
  board: string;
  parent?: string;
  dep?: string[];
}

interface TaskCreateOptions {
  name: string;
  board: string;
  pool?: string;
  dep?: string[];
}

interface SetStatusOptions {
  task: string;
  status: string;
  reason: string;
}

interface ListOptions {
  board: string;
}

interface EventsOptions {
  task: string;
}

type SettableStatus = 'working' | 'waiting' | 'success' | 'failure' | 'canceled';

const SETTABLE_STATUSES: SettableStatus[] = ['working', 'waiting', 'success', 'failure', 'canceled'];

/**
 * Registers task board, pool, task, and dependency commands.
 * Owns the commander surface for task-board daemon operations.
 * Leaves request execution and validation in local helpers.
 */
export function registerTaskCommand(program: Command) {
  const task = program.command('task').description('Manage task boards, pools, tasks, and dependencies.');

  task
    .command('board-create')
    .requiredOption('--name <name>', 'board name')
    .action(async (options: BoardCreateOptions) =>
      runAction(async (client) => {
        const result = await client.do('createTaskBoard', { name: options.name });
        writeJson(result);
      }),
    );

  task
    .command('pool-create')
    .requiredOption('--name <name>', 'pool name')
    .requiredOption('--board <boardId>', 'board id')
    .option('--parent <poolId>', 'parent pool id (defaults to board root)')
    .option('--dep <id...>', 'sibling id this pool depends on (repeatable)')
    .action(async (options: PoolCreateOptions) =>
      runAction(async (client) => {
        const result = await client.do('createTaskPool', {
          boardId: options.board,
          parentPoolId: options.parent ?? null,
          name: options.name,
          dependsOn: options.dep ?? [],
        });
        writeJson(result);
      }),
    );

  task
    .command('create')
    .requiredOption('--name <name>', 'task name')
    .requiredOption('--board <boardId>', 'board id')
    .option('--pool <poolId>', 'containing pool id (defaults to board root)')
    .option('--dep <id...>', 'sibling id this task depends on (repeatable)')
    .action(async (options: TaskCreateOptions) =>
      runAction(async (client) => {
        const result = await client.do('createTask', {
          boardId: options.board,
          poolId: options.pool ?? null,
          name: options.name,
          dependsOn: options.dep ?? [],
        });
        writeJson(result);
      }),
    );

  task
    .command('set-status')
    .requiredOption('--task <taskId>', 'task id')
    .requiredOption('--status <status>', 'one of: working, waiting, success, failure, canceled')
    .requiredOption('--reason <reason>', 'natural language reason for the status change')
    .action(async (options: SetStatusOptions) =>
      runAction(async (client) => {
        const result = await client.do('setTaskStatus', {
          id: options.task,
          status: parseStatus(options.status),
          reason: options.reason,
        });
        writeJson(result);
      }),
    );

  task
    .command('list')
    .requiredOption('--board <boardId>', 'board id')
    .action(async (options: ListOptions) =>
      runAction(async (client) => {
        const result = await client.do('listTasks', { boardId: options.board });
        writeJson(result);
      }),
    );

  task
    .command('events')
    .requiredOption('--task <taskId>', 'task id')
    .action(async (options: EventsOptions) =>
      runAction(async (client) => {
        const result = await client.do('listTaskEvents', { taskId: options.task });
        writeJson(result);
      }),
    );

  task
    .command('board-list')
    .description('List every task board')
    .action(async () =>
      runAction(async (client) => {
        const result = await client.do('listTaskBoards', {});
        writeJson(result);
      }),
    );

  task
    .command('board-delete')
    .requiredOption('--board <boardId>', 'board id')
    .action(async (options: { board: string }) =>
      runAction(async (client) => {
        const result = await client.do('deleteTaskBoard', { id: options.board });
        writeJson(result);
      }),
    );

  task
    .command('pool-delete')
    .requiredOption('--pool <poolId>', 'pool id')
    .action(async (options: { pool: string }) =>
      runAction(async (client) => {
        const result = await client.do('deleteTaskPool', { id: options.pool });
        writeJson(result);
      }),
    );

  task
    .command('delete')
    .description('Delete a task')
    .requiredOption('--task <taskId>', 'task id')
    .action(async (options: { task: string }) =>
      runAction(async (client) => {
        const result = await client.do('deleteTask', { id: options.task });
        writeJson(result);
      }),
    );

  task
    .command('rename')
    .requiredOption('--task <taskId>', 'task id')
    .requiredOption('--name <name>', 'new task name')
    .action(async (options: { task: string; name: string }) =>
      runAction(async (client) => {
        const result = await client.do('renameTask', { id: options.task, name: options.name });
        writeJson(result);
      }),
    );

  task
    .command('set-description')
    .requiredOption('--task <taskId>', 'task id')
    .requiredOption('--description <text>', 'new task description (natural language)')
    .action(async (options: { task: string; description: string }) =>
      runAction(async (client) => {
        const result = await client.do('updateTaskDescription', {
          id: options.task,
          description: options.description,
        });
        writeJson(result);
      }),
    );

  task
    .command('delegate')
    .description('Delegate a task to a runtime agent built from the named registry')
    .requiredOption('--task <taskId>', 'task id')
    .requiredOption('--registry <registryId>', 'agent registry id')
    .action(async (options: { task: string; registry: string }) =>
      runAction(async (client) => {
        const result = await client.do('delegateTask', {
          taskId: options.task,
          agentRegistryId: options.registry,
        });
        writeJson(result);
      }),
    );

  task
    .command('undelegate')
    .requiredOption('--task <taskId>', 'task id')
    .action(async (options: { task: string }) =>
      runAction(async (client) => {
        const result = await client.do('undelegateTask', { taskId: options.task });
        writeJson(result);
      }),
    );

  task
    .command('dep-create')
    .description('Create a dependency edge between two tasks/pools on the same board')
    .requiredOption('--board <boardId>', 'board id')
    .requiredOption('--from <fromId>', 'the depending task or pool id')
    .requiredOption('--to <toId>', 'the depended-on task or pool id')
    .action(async (options: { board: string; from: string; to: string }) =>
      runAction(async (client) => {
        const result = await client.do('createTaskDependency', {
          boardId: options.board,
          fromId: options.from,
          toId: options.to,
        });
        writeJson(result);
      }),
    );

  task
    .command('dep-delete')
    .requiredOption('--from <fromId>', 'the depending task or pool id')
    .requiredOption('--to <toId>', 'the depended-on task or pool id')
    .action(async (options: { from: string; to: string }) =>
      runAction(async (client) => {
        const result = await client.do('deleteTaskDependency', { fromId: options.from, toId: options.to });
        writeJson(result);
      }),
    );
}

async function runAction(callback: (client: WsBridgeClient<ClientProtocol>) => Promise<void>) {
  const client = new WsBridgeClient<ClientProtocol>({ url: DAEMON_URL });
  await client.connect(() => undefined);
  try {
    await callback(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`peb task: ${message}\n`);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

function parseStatus(raw: string): SettableStatus {
  const found = SETTABLE_STATUSES.find((status) => status === raw);
  if (found === undefined) {
    throw new Error(`peb task: invalid status "${raw}"; expected one of ${SETTABLE_STATUSES.join(', ')}`);
  }
  return found;
}

function writeJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
