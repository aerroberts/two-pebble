import type { Datastore, TaskDispatchSettingsRecord, TaskPoolRecord } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { HeartbeatListener, HeartbeatReportDetail } from '../heartbeat-service';
import type { TaskBoardService } from '../task-board-service';
import {
  ancestorsHaveSlots,
  canDispatch,
  countInProgress,
  filterTasksInScope,
  isOpenable,
  orderTasksByDispatchPriority,
} from './dispatch-logic';
import { dispatchTask } from './dispatch-task';
import type { DispatcherScope, DispatchTaskRecord, TaskBoardDispatchServiceInput } from './types';

export class TaskBoardDispatchService {
  private readonly agentRegistry: AgentRegistryService;
  private readonly bridge: DaemonBridge;
  private readonly datastore: Datastore;
  private readonly heartbeat: TaskBoardDispatchServiceInput['heartbeat'];
  private readonly logger: Logger;
  private readonly taskBoards: TaskBoardService;

  public constructor(input: TaskBoardDispatchServiceInput) {
    this.agentRegistry = input.agentRegistry;
    this.bridge = input.bridge;
    this.datastore = input.datastore;
    this.heartbeat = input.heartbeat;
    this.logger = input.logger;
    this.taskBoards = input.taskBoards;
  }

  public async hydrate(): Promise<void> {
    const { items: boards } = await this.datastore.taskBoards.list({});
    for (const board of boards) {
      this.registerBoard(board.id);
    }
    this.logger.info('task board dispatch listeners hydrated', { count: boards.length });
  }

  public registerBoard(boardId: string): void {
    this.heartbeat.register(new TaskBoardDispatchListener({ boardId, service: this }));
  }

  public unregisterBoard(boardId: string): void {
    this.heartbeat.unregister(`taskBoard:${boardId}`);
  }

  public async sweepBoard(boardId: string): Promise<number> {
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
    let dispatched = 0;
    if (boardSettings !== null && canDispatch(boardSettings)) {
      dispatched += await this.dispatchForScope(
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
      if (settings !== undefined && canDispatch(settings)) {
        dispatched += await this.dispatchForScope(
          { kind: 'pool', id: pool.id },
          settings,
          pools,
          tasks,
          boardSettings,
          poolSettings,
        );
      }
    }
    return dispatched;
  }

  private async dispatchForScope(
    scope: DispatcherScope,
    settings: TaskDispatchSettingsRecord,
    pools: TaskPoolRecord[],
    tasks: DispatchTaskRecord[],
    boardSettings: TaskDispatchSettingsRecord | null,
    poolSettings: Map<string, TaskDispatchSettingsRecord>,
  ): Promise<number> {
    const inScope = filterTasksInScope(scope, pools, tasks);
    const slotsFree = settings.concurrency - countInProgress(inScope);
    if (slotsFree <= 0) {
      return 0;
    }
    const registryId = settings.autoAgentRegistryId;
    if (registryId === null) {
      return 0;
    }
    let dispatched = 0;
    for (const task of orderTasksByDispatchPriority(inScope.filter(isOpenable))) {
      if (dispatched >= slotsFree) {
        break;
      }
      if (!ancestorsHaveSlots(task, pools, tasks, boardSettings, poolSettings)) {
        continue;
      }
      try {
        await dispatchTask({
          agentRegistry: this.agentRegistry,
          bridge: this.bridge,
          datastore: this.datastore,
          logger: this.logger,
          registryId,
          task,
          taskBoards: this.taskBoards,
        });
        dispatched += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn('auto-dispatch launch failed', {
          error: message,
          scopeId: scope.id,
          scopeKind: scope.kind,
          taskId: task.id,
        });
      }
    }
    return dispatched;
  }
}

class TaskBoardDispatchListener implements HeartbeatListener {
  public readonly kind = 'task-board' as const;
  public readonly id: string;
  private readonly boardId: string;
  private readonly service: TaskBoardDispatchService;

  public constructor(input: { boardId: string; service: TaskBoardDispatchService }) {
    this.boardId = input.boardId;
    this.service = input.service;
    this.id = `taskBoard:${input.boardId}`;
  }

  public async onHeartbeat(_now: number): Promise<HeartbeatReportDetail> {
    const dispatched = await this.service.sweepBoard(this.boardId);
    if (dispatched === 0) {
      return { outcome: 'skipped', detail: { reason: 'no-ready-tasks', dispatched } };
    }
    return { outcome: 'fired', detail: { dispatched } };
  }
}
