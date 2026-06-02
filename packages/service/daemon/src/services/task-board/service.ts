import type { TaskRecord } from '@two-pebble/datastore';
import { logger } from '@two-pebble/logger';
import type { ProtocolTaskRecord } from '@two-pebble/protocol';
import { TaskBoard } from '@two-pebble/tasks';
import { DaemonService } from '../daemon-service';
import type { GithubService } from '../github';
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
  RecordedTaskEvent,
  SetTaskStatusInput,
  SubmitDeliverableInput,
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

  private get github(): GithubService {
    return this.daemon.requireService<GithubService>('github');
  }

  /**
   * Loads every persisted board into in-memory engines.
   * Replays pools, tasks, then dependencies so each entity exists by the time
   * its dependency edges are added back. Called once during daemon startup.
   */
  public override async initialize(): Promise<void> {
    const projects = await this.datastore.projects.list({});
    const boards = (
      await Promise.all(projects.items.map((project) => this.datastore.taskBoards.list({ projectId: project.id })))
    ).flatMap((page) => page.items);
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
    const record = await this.datastore.taskBoards.create({ name: input.name, projectId: input.projectId });
    this.engines.set(record.id, new TaskBoard(record.id));
    return record;
  }

  /**
   * Renames a board and persists the change.
   * The in-memory engine is unaffected since names are not part of its model;
   * callers receive the updated record so they can echo it on the wire.
   */
  public async updateBoard(id: string, input: { name?: string; defaultTemplateId?: string | null }) {
    return this.datastore.taskBoards.update({ id, ...input });
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
   * Records a free-form 'comment' event on a task. Comments share the task
   * event stream so they render inline in the activity log.
   */
  public async recordCommentEvent(input: { taskId: string; body: string }): Promise<RecordedTaskEvent> {
    const row = await this.datastore.taskBoards.events.record({
      taskId: input.taskId,
      kind: 'comment',
      status: '',
      reason: input.body,
      data: '{}',
    });
    return rowToProtocolEvent(row);
  }

  /**
   * Updates a task's free-form description and persists the change.
   * Like rename, the engine ignores prose fields, so this is a pure DB write.
   */
  public async updateTaskDescription(id: string, description: string, descriptionContent?: string | null) {
    return this.datastore.taskBoards.tasks.updateDescription({ id, description, descriptionContent });
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
   * Assigns (or clears) the template used for tasks created in a group.
   * Template assignment is pool metadata only, so no engine mutation runs.
   */
  public async setPoolTemplate(id: string, defaultTemplateId: string | null) {
    return this.datastore.taskBoards.pools.setTemplate({ id, defaultTemplateId });
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
    // Resolve the template: an explicit `templateId` wins; otherwise prefer the
    // template assigned to the task's group (pool), then fall back to the
    // board template, so per-group configuration overrides the board default.
    let effectiveTemplateId: string | null = null;
    if (input.templateId !== undefined && input.templateId !== null) {
      effectiveTemplateId = input.templateId;
    } else {
      let poolTemplateId: string | null = null;
      if (poolId !== null) {
        const pools = (await this.datastore.taskBoards.pools.list({ boardId: input.boardId })).items;
        poolTemplateId = pools.find((pool) => pool.id === poolId)?.defaultTemplateId ?? null;
      }
      if (poolTemplateId !== null) {
        effectiveTemplateId = poolTemplateId;
      } else {
        const board = await this.datastore.taskBoards.read({ id: input.boardId });
        effectiveTemplateId = board?.defaultTemplateId ?? null;
      }
    }
    const template =
      effectiveTemplateId === null ? null : await this.datastore.taskBoards.templates.read({ id: effectiveTemplateId });
    const templateDeliverables =
      effectiveTemplateId === null
        ? []
        : (await this.datastore.taskBoards.templates.deliverables.list({ templateId: effectiveTemplateId })).items;
    const record = await this.datastore.taskBoards.tasks.create({
      boardId: input.boardId,
      poolId,
      name: input.name,
      description: input.description,
      descriptionContent: input.descriptionContent,
      templateId: effectiveTemplateId,
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
        templateId: effectiveTemplateId,
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

  /**
   * Submits a deliverable for a task. Used identically by CLI, UI, and agents
   * (there is no ownership concept). Text deliverables record a submission
   * directly. `pr_url` deliverables are routed to the GitHub service, which
   * attaches the PR and tracks it until it merges (attach-then-watch); their
   * submission row is only recorded once the PR merges.
   */
  public async submitDeliverable(input: SubmitDeliverableInput) {
    const task = await this.findTask(input.taskId);
    const { items: deliverables } = await this.datastore.taskBoards.deliverables.list({ taskId: input.taskId });
    const deliverable = deliverables.find((entry) => entry.id === input.deliverableId);
    if (deliverable === undefined) {
      throw new Error(`task deliverable "${input.deliverableId}" not found on task "${input.taskId}"`);
    }
    if (deliverable.type !== input.payload.type) {
      throw new Error(`deliverable "${input.deliverableId}" expects payload type "${deliverable.type}"`);
    }
    if (input.payload.type === 'pr_url') {
      const tracked = await this.github.trackPrForDeliverable({
        taskId: task.id,
        deliverableId: deliverable.id,
        url: input.payload.url,
      });
      return { kind: 'tracked_pr' as const, trackedPr: tracked };
    }
    const row = await this.datastore.taskBoards.deliverableSubmissions.upsert({
      taskId: input.taskId,
      deliverableId: input.deliverableId,
      payload: JSON.stringify(input.payload),
    });
    return { kind: 'submission' as const, submission: { ...row, payload: input.payload } };
  }

  /**
   * Updates a task's stored status.
   * The engine rejects illegal transitions (start-from-blocked, leave-terminal).
   */
  public async setTaskStatus(boardId: string, input: SetTaskStatusInput): Promise<TaskMutationOutcome> {
    if (input.status === 'success') {
      await this.assertDeliverablesSubmitted(input.id);
    }
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
    let updated: TaskRecord;
    try {
      updated = await this.datastore.taskBoards.tasks.update({ id: input.id, status: input.status });
    } catch (error) {
      // runMutation already advanced the in-memory engine; if persisting the
      // task row fails the engine would be ahead of the database, so re-sync it.
      await this.restoreBoardFromDatabase(boardId);
      throw error;
    }
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
    try {
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
    } catch (error) {
      // The in-memory engine has already applied the mutation, but persisting
      // its events failed. Re-hydrate the board from the database so the engine
      // cannot drift ahead of durable state; the caller still sees the error.
      await this.restoreBoardFromDatabase(context.boardId);
      throw error;
    }
  }

  /**
   * Rebuilds a board's engine from the database, discarding any in-memory
   * mutation whose persistence failed. Best-effort: if re-hydration itself
   * fails the original error is surfaced unchanged.
   */
  private async restoreBoardFromDatabase(boardId: string): Promise<void> {
    try {
      await this.hydrateBoard(boardId);
    } catch (restoreError) {
      logger.warn('failed to restore task board engine from database after a mutation failure', {
        boardId,
        error: restoreError instanceof Error ? restoreError.message : String(restoreError),
      });
    }
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

  /**
   * Guards the transition to `success` so a task cannot be completed while any
   * deliverable is still outstanding. A task with no deliverables passes freely.
   *
   * - A `text` deliverable is resolved once it has a submission.
   * - A `pr_url` deliverable is resolved only when a GitHub PR has been attached
   *   **and that PR has merged** — encoding the rule that a task requiring a PR
   *   cannot complete until the PR is merged. "No PR attached" and "PR not yet
   *   merged" are reported as distinct, actionable reasons.
   */
  private async assertDeliverablesSubmitted(taskId: string): Promise<void> {
    const { items: deliverables } = await this.datastore.taskBoards.deliverables.list({ taskId });
    if (deliverables.length === 0) {
      return;
    }
    const { items: submissions } = await this.datastore.taskBoards.deliverableSubmissions.list({ taskId });
    const submitted = new Set(submissions.map((submission) => submission.deliverableId));
    const { items: trackedPrs } = await this.datastore.trackedPrs.list({ taskId });
    const prByDeliverable = new Map(trackedPrs.map((pr) => [pr.deliverableId, pr]));

    const reasons: string[] = [];
    for (const deliverable of deliverables) {
      if (deliverable.type === 'pr_url') {
        const pr = prByDeliverable.get(deliverable.id);
        if (pr === undefined) {
          reasons.push(`"${deliverable.name}" has no PR submitted`);
        } else if (pr.state !== 'merged') {
          reasons.push(`"${deliverable.name}" PR ${pr.repo}#${pr.number} is not merged (${pr.state})`);
        }
        continue;
      }
      if (!submitted.has(deliverable.id)) {
        reasons.push(`"${deliverable.name}" not yet submitted`);
      }
    }
    if (reasons.length > 0) {
      throw new Error(`cannot mark task "${taskId}" as success: ${reasons.join('; ')}`);
    }
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
