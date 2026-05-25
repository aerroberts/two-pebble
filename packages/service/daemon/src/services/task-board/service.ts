import { logger } from '@two-pebble/logger';
import type { ProtocolTaskRecord } from '@two-pebble/protocol';
import { TaskBoard, TaskOwnershipError } from '@two-pebble/tasks';
import { DaemonService } from '../daemon-service';
import { rowToProtocolEvent } from './event-mapping';
import { hydrateTaskBoard } from './hydration';
import { toProtocolTask } from './protocol-task';
import type {
  BoardSnapshot,
  CapturedStatusEvent,
  CreateBoardInput,
  CreateDependencyInput,
  CreatePoolInput,
  CreateTaskInput,
  DeleteDependencyInput,
  DependencyMutationOutcome,
  MutationContextInput,
  MutationOutcome,
  OwnerId,
  RecordDelegationInput,
  RecordedTaskEvent,
  RecordUndelegationInput,
  SetTaskStatusAsAgentInput,
  SetTaskStatusInput,
  SubmitDeliverableAsAgentInput,
  SyncTasksFromAgentInput,
  SyncTasksFromAgentResult,
  TaskMutationOutcome,
} from './types';

/**
 * Owns the in-memory TaskBoard engine for every persisted board.
 * Validates mutations through the engine first (cycle, sibling, status rules)
 * and only persists when the engine accepts the change. The daemon handlers
 * call this service rather than the datastore directly.
 */
export class TaskBoardService extends DaemonService {
  public readonly id = 'task-board';
  private readonly engines = new Map<string, TaskBoard>();

  private get datastore() {
    return this.daemon.datastore;
  }

  /**
   * Loads every persisted board into in-memory engines.
   * Replays pools, tasks, then dependencies so each entity exists by the time
   * its dependency edges are added back. Called once during daemon startup.
   */
  public override async initialize(): Promise<void> {
    const { items: boards } = await this.datastore.taskBoards.list({});
    for (const board of boards) {
      await this.hydrateBoard(board.id);
    }
    logger.info('task boards hydrated', { count: boards.length });
  }

  /**
   * Creates a new board with no contents.
   * Persists the board row and registers an empty in-memory engine for it.
   */
  public async createBoard(input: CreateBoardInput) {
    const record = await this.datastore.taskBoards.create({ name: input.name });
    this.engines.set(record.id, new TaskBoard(record.id));
    return record;
  }

  /**
   * Renames a board and persists the change.
   * The in-memory engine is unaffected since names are not part of its model;
   * callers receive the updated record so they can echo it on the wire.
   */
  public async updateBoard(id: string, name: string) {
    return this.datastore.taskBoards.update({ id, name });
  }

  /**
   * Renames a task and persists the change.
   * The in-memory engine is unaffected since names are not part of its model;
   * callers receive the updated record so they can echo it on the wire.
   */
  public async renameTask(id: string, name: string) {
    return this.datastore.taskBoards.tasks.rename({ id, name });
  }

  /**
   * Sets or clears a task's owning agent. Pure DB write; the engine doesn't
   * track ownership so no engine call is needed.
   */
  public async setTaskOwner(id: string, ownerId: OwnerId) {
    const record = await this.datastore.taskBoards.tasks.setOwner({ id, ownerId });
    return record;
  }

  /**
   * Records a 'delegated' event on a task with the agent + registry references.
   */
  public async recordDelegationEvent(input: RecordDelegationInput): Promise<RecordedTaskEvent> {
    const data = JSON.stringify({
      agentId: input.agentId,
      agentRegistryId: input.agentRegistryId,
      agentName: input.agentName,
    });
    const row = await this.datastore.taskBoards.events.record({
      taskId: input.taskId,
      kind: 'delegated',
      status: '',
      reason: input.reason,
      data,
    });
    return rowToProtocolEvent(row);
  }

  /**
   * Records an 'undelegated' event noting the agent that was removed.
   */
  public async recordUndelegationEvent(input: RecordUndelegationInput): Promise<RecordedTaskEvent> {
    const data = JSON.stringify({ agentId: input.agentId });
    const row = await this.datastore.taskBoards.events.record({
      taskId: input.taskId,
      kind: 'undelegated',
      status: '',
      reason: input.reason,
      data,
    });
    return rowToProtocolEvent(row);
  }

  /**
   * Updates a task's free-form description and persists the change.
   * Like rename, the engine ignores prose fields, so this is a pure DB write.
   */
  public async updateTaskDescription(id: string, description: string) {
    return this.datastore.taskBoards.tasks.updateDescription({ id, description });
  }

  /**
   * Deletes a board along with every pool, task, and dependency it owned.
   * The in-memory engine is dropped; the datastore cascade is performed by
   * the boards.delete operation, which handles all dependent rows.
   */
  public async deleteBoard(id: string) {
    await this.datastore.taskBoards.delete({ id });
    this.engines.delete(id);
  }

  /**
   * Creates a pool inside a board, validating sibling and acyclicity rules.
   * Persists the pool row and stitches it into the in-memory engine atomically.
   */
  public async createPool(input: CreatePoolInput) {
    const record = await this.datastore.taskBoards.pools.create({
      boardId: input.boardId,
      parentPoolId: input.parentPoolId,
      name: input.name,
    });
    await this.runMutation({ boardId: input.boardId, cascadeReason: 'auto: pool added' }, (engine) => {
      engine.addPool({
        id: record.id,
        parentPoolId: input.parentPoolId ?? undefined,
        dependsOn: input.dependsOn,
      });
    });
    return record;
  }

  /**
   * Removes a pool. Throws when the pool still has members.
   * Mirrors the engine validation; persistent rows are cleaned up after.
   */
  public async deletePool(boardId: string, id: string): Promise<RecordedTaskEvent[]> {
    const { events } = await this.runMutation({ boardId, cascadeReason: 'auto: pool removed' }, (engine) => {
      engine.removePool(id);
    });
    await this.datastore.taskBoards.pools.delete({ id });
    return events;
  }

  /**
   * Creates a task inside a board, optionally inside a pool.
   * Validates the dependency edges through the in-memory engine before persisting.
   */
  public async createTask(input: CreateTaskInput): Promise<TaskMutationOutcome> {
    const poolId = input.poolId !== null && input.poolId !== undefined && input.poolId.length > 0 ? input.poolId : null;
    if (poolId !== null) {
      const engine = this.requireEngine(input.boardId);
      const hasPool = engine.listPools().some((pool) => pool.id === poolId);
      if (!hasPool) {
        throw new Error(`task pool "${poolId}" not found on board "${input.boardId}"`);
      }
    }
    const template =
      input.templateId === undefined || input.templateId === null
        ? null
        : await this.datastore.taskBoards.templates.read({ id: input.templateId });
    const templateDeliverables =
      input.templateId === undefined || input.templateId === null
        ? []
        : (await this.datastore.taskBoards.templates.deliverables.list({ templateId: input.templateId })).items;
    const record = await this.datastore.taskBoards.tasks.create({
      boardId: input.boardId,
      poolId,
      name: input.name,
      description: input.description,
      templateId: input.templateId ?? null,
      status: 'pending',
    });
    const { events } = await this.runMutation(
      {
        boardId: input.boardId,
        primaryTaskId: record.id,
        primaryReason: 'task created',
        cascadeReason: 'auto: dependency state changed',
      },
      (engine) => {
        engine.addTask({ id: record.id, poolId: poolId ?? undefined, dependsOn: input.dependsOn });
      },
    );
    let persisted = record;
    if (template !== null) {
      for (const templateDeliverable of templateDeliverables) {
        await this.datastore.taskBoards.deliverables.create({
          taskId: record.id,
          name: templateDeliverable.name,
          description: templateDeliverable.description,
          type: templateDeliverable.type,
          orderIndex: templateDeliverable.orderIndex,
        });
      }
      persisted = await this.datastore.taskBoards.tasks.update({
        id: record.id,
        templateId: input.templateId,
        additionalContext: template.prompt,
      });
    }
    const engine = this.requireEngine(input.boardId);
    return { result: toProtocolTask(persisted, engine), events };
  }

  public async listTaskDeliverables(taskId: string) {
    return this.datastore.taskBoards.deliverables.list({ taskId });
  }

  public async listTaskDeliverableSubmissions(taskId: string) {
    const { items } = await this.datastore.taskBoards.deliverableSubmissions.list({ taskId });
    return { items: items.map((row) => ({ ...row, payload: JSON.parse(row.payload) })) };
  }

  public async submitDeliverableAsAgent(input: SubmitDeliverableAsAgentInput) {
    const task = await this.findTask(input.taskId);
    if (task.ownerId !== input.agentId) {
      throw new TaskOwnershipError(input.taskId, input.agentId, task.ownerId);
    }
    const { items: deliverables } = await this.datastore.taskBoards.deliverables.list({ taskId: input.taskId });
    const deliverable = deliverables.find((entry) => entry.id === input.deliverableId);
    if (deliverable === undefined) {
      throw new Error(`task deliverable "${input.deliverableId}" not found on task "${input.taskId}"`);
    }
    if (deliverable.type !== input.payload.type) {
      throw new Error(`deliverable "${input.deliverableId}" expects payload type "${deliverable.type}"`);
    }
    const row = await this.datastore.taskBoards.deliverableSubmissions.upsert({
      taskId: input.taskId,
      deliverableId: input.deliverableId,
      payload: JSON.stringify(input.payload),
    });
    return { ...row, payload: input.payload };
  }

  /**
   * Owner-aware status mutation used by agent-initiated paths.
   * Resolves the task across boards, asserts `task.ownerId === agentId`, then
   * delegates to `setTaskStatus`. Throws `TaskOwnershipError` on mismatch so
   * the tool layer can surface a precise reason. UI paths continue to call
   * `setTaskStatus` directly and remain unrestricted by ownership.
   */
  public async setTaskStatusAsAgent(input: SetTaskStatusAsAgentInput): Promise<TaskMutationOutcome> {
    const found = await this.findTask(input.taskId);
    if (found.ownerId !== input.agentId) {
      throw new TaskOwnershipError(input.taskId, input.agentId, found.ownerId);
    }
    return this.setTaskStatus(found.boardId, {
      id: input.taskId,
      status: input.status,
      reason: input.reason,
    });
  }

  /**
   * Updates a task's stored status.
   * The engine rejects illegal transitions (start-from-blocked, leave-terminal).
   */
  public async setTaskStatus(boardId: string, input: SetTaskStatusInput): Promise<TaskMutationOutcome> {
    const { events } = await this.runMutation(
      {
        boardId,
        primaryTaskId: input.id,
        primaryReason: input.reason,
        cascadeReason: 'auto: dependency state changed',
      },
      (engine) => {
        engine.setTaskStatus(input.id, input.status);
      },
    );
    const updated = await this.datastore.taskBoards.tasks.update({ id: input.id, status: input.status });
    const engine = this.requireEngine(boardId);
    return { result: toProtocolTask(updated, engine), events };
  }

  /**
   * Removes a task and every dependency edge that touches it.
   * The engine cleanup happens first; the database row is removed second.
   */
  public async deleteTask(boardId: string, id: string): Promise<RecordedTaskEvent[]> {
    const { events } = await this.runMutation({ boardId, cascadeReason: 'auto: task removed' }, (engine) => {
      engine.removeTask(id);
    });
    await this.datastore.taskBoards.tasks.delete({ id });
    return events;
  }

  /**
   * Adds a dependency edge between two siblings on the same board.
   * The engine validates sibling and acyclicity rules before persistence.
   */
  public async createDependency(input: CreateDependencyInput): Promise<DependencyMutationOutcome> {
    const { events } = await this.runMutation(
      { boardId: input.boardId, cascadeReason: 'auto: dependency added' },
      (engine) => {
        engine.addDependency({ fromId: input.fromId, toId: input.toId });
      },
    );
    const record = await this.datastore.taskBoards.dependencies.create({
      boardId: input.boardId,
      fromId: input.fromId,
      toId: input.toId,
    });
    return { result: record, events };
  }

  /**
   * Removes a dependency edge between two entities.
   * Engine update fires first so any unblock cascades reach observers.
   */
  public async deleteDependency(boardId: string, input: DeleteDependencyInput): Promise<RecordedTaskEvent[]> {
    const { events } = await this.runMutation({ boardId, cascadeReason: 'auto: dependency removed' }, (engine) => {
      engine.removeDependency(input.fromId, input.toId);
    });
    await this.datastore.taskBoards.dependencies.delete({ fromId: input.fromId, toId: input.toId });
    return events;
  }

  /**
   * Reads the latest snapshot for a board: pools, tasks, deps.
   * Tasks include the derived effective status so observers do not have to
   * recompute the engine semantics on the wire.
   */
  public async readBoardSnapshot(boardId: string): Promise<BoardSnapshot> {
    const board = await this.datastore.taskBoards.read({ id: boardId });
    const pools = await this.datastore.taskBoards.pools.list({ boardId });
    const tasks = await this.datastore.taskBoards.tasks.list({ boardId });
    const dependencies = await this.datastore.taskBoards.dependencies.list({ boardId });
    const engine = this.requireEngine(boardId);
    return {
      board,
      pools: pools.items,
      tasks: tasks.items.map((task) => toProtocolTask(task, engine)),
      dependencies: dependencies.items,
    };
  }

  /**
   * Lists every task on a board with the engine's effective status attached.
   * Useful for the protocol list operation that needs the derived status.
   */
  public async listTasks(boardId: string): Promise<ProtocolTaskRecord[]> {
    const tasks = await this.datastore.taskBoards.tasks.list({ boardId });
    const engine = this.requireEngine(boardId);
    return tasks.items.map((task) => toProtocolTask(task, engine));
  }

  /**
   * Lists every recorded event for a single task in chronological order.
   * Used by the protocol's listTaskEvents op and by CLI history queries.
   */
  public async listTaskEvents(taskId: string): Promise<RecordedTaskEvent[]> {
    const { items } = await this.datastore.taskBoards.events.list({ taskId });
    return items.map((row) => rowToProtocolEvent(row));
  }

  /**
   * Propagates a delegate agent's terminal failure to any task it owns.
   * Tasks already in a terminal state are left untouched so explicit human
   * overrides are not overwritten by the after-the-fact sync.
   */
  public async syncOwnedTasksFromAgentStatus(input: SyncTasksFromAgentInput): Promise<SyncTasksFromAgentResult> {
    const targetStatus = 'failure';
    const reason = input.reason ?? `auto: agent ${input.agentStatus}`;
    const { items: boards } = await this.datastore.taskBoards.list({});
    const tasksOut: ProtocolTaskRecord[] = [];
    const events: RecordedTaskEvent[] = [];
    for (const board of boards) {
      const { items: tasks } = await this.datastore.taskBoards.tasks.list({ boardId: board.id });
      const owned = tasks.filter((task) => task.ownerId === input.agentId);
      for (const task of owned) {
        if (task.status === 'success' || task.status === 'failure') {
          continue;
        }
        try {
          const outcome = await this.setTaskStatus(board.id, { id: task.id, status: targetStatus, reason });
          tasksOut.push(outcome.result);
          events.push(...outcome.events);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.warn('task status sync from agent failed', {
            agentId: input.agentId,
            agentStatus: input.agentStatus,
            error: message,
            taskId: task.id,
          });
        }
      }
    }
    return { tasks: tasksOut, events };
  }

  private async runMutation<T>(
    context: MutationContextInput,
    mutation: (engine: TaskBoard) => T,
  ): Promise<MutationOutcome<T>> {
    const engine = this.requireEngine(context.boardId);
    const captured: CapturedStatusEvent[] = [];
    const unsubscribe = engine.subscribe((event) => {
      const reason =
        event.taskId === context.primaryTaskId && context.primaryReason !== undefined
          ? context.primaryReason
          : context.cascadeReason;
      captured.push({ taskId: event.taskId, status: event.next, reason });
    });
    let result: T;
    try {
      result = mutation(engine);
    } finally {
      unsubscribe();
    }
    const events: RecordedTaskEvent[] = [];
    for (const captureEvent of captured) {
      const row = await this.datastore.taskBoards.events.record({
        taskId: captureEvent.taskId,
        kind: 'status',
        status: captureEvent.status,
        reason: captureEvent.reason,
        data: JSON.stringify({ status: captureEvent.status }),
      });
      events.push(rowToProtocolEvent(row));
    }
    return { result, events };
  }

  private async hydrateBoard(boardId: string): Promise<void> {
    const engine = await hydrateTaskBoard({ boardId, datastore: this.datastore, logger });
    this.engines.set(boardId, engine);
  }

  private requireEngine(boardId: string): TaskBoard {
    const engine = this.engines.get(boardId);
    if (engine === undefined) {
      throw new Error(`task board "${boardId}" not loaded`);
    }
    return engine;
  }

  private async findTask(taskId: string) {
    const { items: boards } = await this.datastore.taskBoards.list({});
    for (const board of boards) {
      const { items: tasks } = await this.datastore.taskBoards.tasks.list({ boardId: board.id });
      const found = tasks.find((task) => task.id === taskId);
      if (found !== undefined) {
        return found;
      }
    }
    throw new Error(`task "${taskId}" not found`);
  }
}
