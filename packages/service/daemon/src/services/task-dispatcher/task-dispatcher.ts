import type { Datastore, TaskDispatchSettingsRecord, TaskPoolRecord } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { ProtocolTaskRecord } from '@two-pebble/protocol';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { TaskBoardService } from '../task-board-service';
import type { DispatcherScope, TaskDispatcherServiceContext } from './types';

/**
 * Event-driven auto-dispatch loop.
 *
 * Subscribes to `taskBoards.events` and `agentRegistry.events`; whenever a
 * board mutates or an owner agent finishes, sweeps every scope on that
 * board to see whether an automated registry can claim more tasks.
 *
 * Cumulative concurrency: a task inside a pool counts against both the
 * pool's slot budget and the board's. A task can only be dispatched if
 * every ancestor scope (the task's pool chain up to the board) has a free
 * slot under its own settings.
 */
export class TaskDispatcherService {
  private readonly agentRegistry: AgentRegistryService;
  private readonly bridge: DaemonBridge;
  private readonly datastore: Datastore;
  private readonly logger: Logger;
  private readonly taskBoards: TaskBoardService;

  private readonly pendingSweeps = new Map<string, NodeJS.Timeout>();
  private readonly inFlightSweeps = new Map<string, Promise<void>>();
  private subscriptions: Array<() => void> = [];
  private started = false;
  private static readonly DEBOUNCE_MS = 50;

  public constructor(context: TaskDispatcherServiceContext) {
    this.agentRegistry = context.agentRegistry;
    this.bridge = context.bridge;
    this.datastore = context.datastore;
    this.logger = context.logger;
    this.taskBoards = context.taskBoards;
  }

  /**
   * Subscribes to in-process events and runs a boot sweep over every board.
   * Safe to call once; subsequent calls return without subscribing again.
   */
  public async start(): Promise<void> {
    if (this.started) {
      return;
    }
    this.started = true;
    const onBoardChanged = ({ boardId }: { boardId: string }): void => {
      this.scheduleBoardSweep(boardId);
    };
    const onAgentStatusChanged = (): void => {
      this.scheduleAllBoardsSweep();
    };
    this.taskBoards.events.on('boardChanged', onBoardChanged);
    this.agentRegistry.events.on('agentStatusChanged', onAgentStatusChanged);
    this.subscriptions.push(
      () => this.taskBoards.events.off('boardChanged', onBoardChanged),
      () => this.agentRegistry.events.off('agentStatusChanged', onAgentStatusChanged),
    );
    await this.sweepAllBoards();
  }

  /**
   * Tears down subscriptions and cancels any debounced sweeps.
   */
  public stop(): void {
    if (!this.started) {
      return;
    }
    this.started = false;
    for (const off of this.subscriptions) {
      try {
        off();
      } catch {
        // Best effort unsubscribe.
      }
    }
    this.subscriptions = [];
    for (const timer of this.pendingSweeps.values()) {
      clearTimeout(timer);
    }
    this.pendingSweeps.clear();
  }

  /**
   * Schedules a sweep for a single board. Used by the dispatch-settings
   * handler when an upsert lands so the new policy takes effect without
   * waiting for the next task event.
   */
  public kickBoard(boardId: string): void {
    this.scheduleBoardSweep(boardId);
  }

  private scheduleAllBoardsSweep(): void {
    this.scheduleSweep('__all__', () => this.sweepAllBoards());
  }

  private scheduleBoardSweep(boardId: string): void {
    this.scheduleSweep(`board:${boardId}`, () => this.sweepBoard(boardId));
  }

  private scheduleSweep(key: string, runner: () => Promise<void>): void {
    const existing = this.pendingSweeps.get(key);
    if (existing !== undefined) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      this.pendingSweeps.delete(key);
      this.runSweep(key, runner);
    }, TaskDispatcherService.DEBOUNCE_MS);
    this.pendingSweeps.set(key, timer);
  }

  private runSweep(key: string, runner: () => Promise<void>): void {
    const inflight = this.inFlightSweeps.get(key);
    if (inflight !== undefined) {
      // Coalesce: schedule another sweep right after the current one finishes.
      inflight.finally(() => this.scheduleSweep(key, runner));
      return;
    }
    const promise = runner()
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn('task dispatcher sweep failed', { key, error: message });
      })
      .finally(() => {
        this.inFlightSweeps.delete(key);
      });
    this.inFlightSweeps.set(key, promise);
  }

  private async sweepAllBoards(): Promise<void> {
    const { items: boards } = await this.datastore.taskBoards.list({});
    for (const board of boards) {
      await this.sweepBoard(board.id);
    }
  }

  private async sweepBoard(boardId: string): Promise<void> {
    const { items: pools } = await this.datastore.taskBoards.pools.list({ boardId });
    const tasks = await this.taskBoards.listTasks(boardId);
    const boardSettings = await this.datastore.taskBoards.dispatchSettings.read({
      scopeKind: 'board',
      scopeId: boardId,
    });
    const poolSettings = new Map<string, TaskDispatchSettingsRecord>();
    for (const pool of pools) {
      const settings = await this.datastore.taskBoards.dispatchSettings.read({
        scopeKind: 'pool',
        scopeId: pool.id,
      });
      if (settings !== null) {
        poolSettings.set(pool.id, settings);
      }
    }
    if (boardSettings !== null && this.canDispatch(boardSettings)) {
      await this.dispatchForScope(
        { kind: 'board', id: boardId },
        boardSettings,
        pools,
        tasks,
        boardSettings,
        poolSettings,
      );
    }
    for (const pool of pools) {
      const settings = poolSettings.get(pool.id);
      if (settings !== undefined && this.canDispatch(settings)) {
        await this.dispatchForScope({ kind: 'pool', id: pool.id }, settings, pools, tasks, boardSettings, poolSettings);
      }
    }
  }

  private canDispatch(settings: TaskDispatchSettingsRecord): boolean {
    return settings.dispatchMode === 'automatic' && settings.concurrency > 0 && settings.autoAgentRegistryId !== null;
  }

  private async dispatchForScope(
    scope: DispatcherScope,
    settings: TaskDispatchSettingsRecord,
    pools: TaskPoolRecord[],
    tasks: ProtocolTaskRecordWithStored[],
    boardSettings: TaskDispatchSettingsRecord | null,
    poolSettings: Map<string, TaskDispatchSettingsRecord>,
  ): Promise<void> {
    const inScope = filterTasksInScope(scope, pools, tasks);
    const inProgressInScope = inScope.filter(isInProgress).length;
    const slotsFree = settings.concurrency - inProgressInScope;
    if (slotsFree <= 0) {
      return;
    }
    const openTasks = inScope.filter(isOpenable);
    const ordered = orderTasksByDispatchPriority(openTasks);
    const registryId = settings.autoAgentRegistryId;
    if (registryId === null) {
      return;
    }
    let dispatched = 0;
    for (const task of ordered) {
      if (dispatched >= slotsFree) {
        break;
      }
      const ancestorOk = await this.ancestorsHaveSlots(task, pools, tasks, boardSettings, poolSettings);
      if (!ancestorOk) {
        continue;
      }
      try {
        await this.dispatchTask(task, registryId);
        dispatched += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn('auto-dispatch launch failed', {
          taskId: task.id,
          scopeKind: scope.kind,
          scopeId: scope.id,
          error: message,
        });
      }
    }
  }

  private async ancestorsHaveSlots(
    task: ProtocolTaskRecordWithStored,
    pools: TaskPoolRecord[],
    tasks: ProtocolTaskRecordWithStored[],
    boardSettings: TaskDispatchSettingsRecord | null,
    poolSettings: Map<string, TaskDispatchSettingsRecord>,
  ): Promise<boolean> {
    if (boardSettings !== null && boardSettings.concurrency > 0) {
      const boardInProgress = tasks.filter(isInProgress).length;
      if (boardInProgress >= boardSettings.concurrency) {
        return false;
      }
    }
    let cursor: string | null = task.poolId;
    while (cursor !== null) {
      const settings = poolSettings.get(cursor);
      if (settings !== undefined && settings.concurrency > 0) {
        const poolTasks = collectPoolTasks(cursor, pools, tasks);
        const poolInProgress = poolTasks.filter(isInProgress).length;
        if (poolInProgress >= settings.concurrency) {
          return false;
        }
      }
      const pool = pools.find((entry) => entry.id === cursor);
      cursor = pool?.parentPoolId ?? null;
    }
    return true;
  }

  private async dispatchTask(task: ProtocolTaskRecordWithStored, registryId: string): Promise<void> {
    const registry = await this.datastore.agentRegistries.read({ id: registryId });
    const launched = await this.agentRegistry.launch({
      agentRegistryId: registryId,
      message: 'Please complete the assigned task.',
      extraCapabilities: [
        {
          id: 'task-lifecycle',
          config: {
            taskId: task.id,
            boardId: task.boardId,
            taskName: task.name,
            taskDescription: task.description,
          },
        },
      ],
    });
    const trace = await this.datastore.agent.traces.record({
      agentId: launched.id,
      data: {
        taskId: task.id,
        taskName: task.name,
        taskDescription: task.description,
        boardId: task.boardId,
      },
      id: crypto.randomUUID(),
      orderId: 0,
      type: 'task-assigned',
    });
    this.bridge.emit('agentTraceRecorded', trace);
    await this.taskBoards.setTaskOwner(task.id, launched.id);
    await this.taskBoards.recordDelegationEvent({
      taskId: task.id,
      agentId: launched.id,
      agentRegistryId: registryId,
      agentName: registry.name,
      reason: `auto: dispatched to ${registry.name}`,
    });
    await this.taskBoards.setTaskStatus(task.boardId, {
      id: task.id,
      status: 'working',
      reason: `auto: dispatched to ${registry.name}`,
    });
    this.logger.info('task auto-dispatched', { taskId: task.id, agentId: launched.id, registryId });
  }
}

type ProtocolTaskRecordWithStored = ProtocolTaskRecord;

function isInProgress(task: ProtocolTaskRecordWithStored): boolean {
  return task.status === 'working' || task.status === 'waiting';
}

function isOpenable(task: ProtocolTaskRecordWithStored): boolean {
  return task.effectiveStatus === 'open' && task.ownerId === null;
}

function filterTasksInScope(
  scope: DispatcherScope,
  pools: TaskPoolRecord[],
  tasks: ProtocolTaskRecordWithStored[],
): ProtocolTaskRecordWithStored[] {
  if (scope.kind === 'board') {
    return tasks;
  }
  return collectPoolTasks(scope.id, pools, tasks);
}

function collectPoolTasks(
  rootPoolId: string,
  pools: TaskPoolRecord[],
  tasks: ProtocolTaskRecordWithStored[],
): ProtocolTaskRecordWithStored[] {
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

function orderTasksByDispatchPriority(tasks: ProtocolTaskRecordWithStored[]): ProtocolTaskRecordWithStored[] {
  return [...tasks].sort((a, b) => a.createdAt - b.createdAt);
}
