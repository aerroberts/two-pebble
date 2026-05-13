import { BlockerGraph } from './blocker-graph';
import { CycleError } from './errors/cycle-error';
import { DuplicateIdError } from './errors/duplicate-id-error';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition-error';
import { NonEmptyPoolError } from './errors/non-empty-pool-error';
import { NotFoundError } from './errors/not-found-error';
import { SelfDependencyError } from './errors/self-dependency-error';
import { SiblingViolationError } from './errors/sibling-violation-error';
import type {
  AddDependencyInput,
  AddPoolInput,
  AddTaskInput,
  DependencyRecord,
  EffectiveStatusMap,
  ParentId,
  PoolRecord,
  SettableTaskStatus,
  TaskBoardListener,
  TaskBoardUnsubscribe,
  TaskEffectiveStatus,
  TaskRecord,
  TaskStoredStatus,
} from './types';

/**
 * In-memory model of a single task board.
 * Owns tasks, pools, and the dependency graph between them via BlockerGraph.
 * Validates every mutation and emits status events when effective state shifts.
 */
export class TaskBoard {
  public readonly id: string;

  private readonly graph = new BlockerGraph();
  private readonly listeners: TaskBoardListener[] = [];
  private readonly poolsById = new Map<string, PoolRecord>();
  private readonly storedStatusByTaskId = new Map<string, TaskStoredStatus>();
  private readonly tasksById = new Map<string, TaskRecord>();

  /**
   * Creates an empty board with a stable id.
   * The id is exposed on every task and pool so consumers can route records.
   * Boards do not maintain global state beyond what their tasks and pools record.
   */
  public constructor(id: string) {
    this.id = id;
  }

  /**
   * Registers a new pool inside the board, optionally under another pool.
   * Validates that the parent exists, the id is unique, and any provided
   * dependencies satisfy sibling and acyclicity rules. Throws on violation.
   */
  public addPool(input: AddPoolInput): PoolRecord {
    this.requireUniqueId(input.id);
    const parentId = input.parentPoolId ?? null;
    if (parentId !== null) {
      this.requirePool(parentId);
    }
    const record: PoolRecord = { id: input.id, boardId: this.id, parentPoolId: parentId };
    this.poolsById.set(input.id, record);
    this.graph.registerEntity(input.id, parentId, true);
    this.applyDependencies(input.id, input.dependsOn ?? []);
    return { ...record };
  }

  /**
   * Registers a new task inside the board, optionally inside a pool.
   * Validates that the pool exists, the id is unique, and any provided
   * dependencies satisfy sibling and acyclicity rules. Throws on violation.
   */
  public addTask(input: AddTaskInput): TaskRecord {
    this.requireUniqueId(input.id);
    const parentId = input.poolId ?? null;
    if (parentId !== null) {
      this.requirePool(parentId);
    }
    const previous = this.snapshotTaskStatuses();
    const record: TaskRecord = { id: input.id, boardId: this.id, poolId: parentId, status: 'pending' };
    this.tasksById.set(input.id, record);
    this.storedStatusByTaskId.set(input.id, 'pending');
    this.graph.registerEntity(input.id, parentId, false);
    this.applyDependencies(input.id, input.dependsOn ?? []);
    this.emitStatusChanges(previous);
    return { ...record };
  }

  /**
   * Adds one dependency edge after the entity has been created.
   * Validates the sibling rule, rejects self-deps, and rejects edges that would
   * close a cycle in the blocker graph. Emits any cascading status events.
   */
  public addDependency(input: AddDependencyInput): void {
    this.validateDependency(input.fromId, input.toId);
    if (this.graph.hasEdge(input.fromId, input.toId)) {
      return;
    }
    const previous = this.snapshotTaskStatuses();
    this.graph.addEdge(input.fromId, input.toId);
    this.emitStatusChanges(previous);
  }

  /**
   * Removes a single dependency edge if it exists; no-op otherwise.
   * Removing a dependency may unblock previously-blocked tasks. Any tasks
   * whose effective status changes will trigger subscriber events.
   */
  public removeDependency(fromId: string, toId: string): void {
    if (!this.graph.hasEdge(fromId, toId)) {
      return;
    }
    const previous = this.snapshotTaskStatuses();
    this.graph.removeEdge(fromId, toId);
    this.emitStatusChanges(previous);
  }

  /**
   * Removes a task from the board along with every dependency that touches it.
   * Other tasks may unblock once the task and its outgoing edges disappear.
   * Throws when the id is not a known task; pools are removed via removePool.
   */
  public removeTask(taskId: string): void {
    if (!this.tasksById.has(taskId)) {
      throw new NotFoundError(taskId);
    }
    const previous = this.snapshotTaskStatuses();
    this.graph.forgetEntity(taskId);
    this.tasksById.delete(taskId);
    this.storedStatusByTaskId.delete(taskId);
    this.emitStatusChanges(previous);
  }

  /**
   * Removes an empty pool from the board along with every dependency edge.
   * Throws if the pool still owns tasks or sub-pools; the engine never
   * cascade-deletes since callers may want different cleanup semantics.
   */
  public removePool(poolId: string): void {
    if (!this.poolsById.has(poolId)) {
      throw new NotFoundError(poolId);
    }
    const memberCount = this.graph.childCountOf(poolId);
    if (memberCount > 0) {
      throw new NonEmptyPoolError(poolId, memberCount);
    }
    const previous = this.snapshotTaskStatuses();
    this.graph.forgetEntity(poolId);
    this.poolsById.delete(poolId);
    this.emitStatusChanges(previous);
  }

  /**
   * Updates a task's stored status to a settable value.
   * Rejects changes from a terminal state and rejects starting work on a blocked task.
   * Cascading effective-status changes are emitted to subscribers.
   */
  public setTaskStatus(taskId: string, status: SettableTaskStatus): void {
    const task = this.tasksById.get(taskId);
    if (task === undefined) {
      throw new NotFoundError(taskId);
    }
    const currentEffective = this.computeEffectiveStatus(taskId);
    this.requireValidTransition(taskId, currentEffective, status);
    const previous = this.snapshotTaskStatuses();
    this.storedStatusByTaskId.set(taskId, status);
    task.status = status;
    this.emitStatusChanges(previous);
  }

  /**
   * Returns a defensive copy of the task record for the given id.
   * The returned object is safe for callers to mutate without affecting the board.
   * Throws if no task is registered under that id.
   */
  public getTask(taskId: string): TaskRecord {
    const task = this.tasksById.get(taskId);
    if (task === undefined) {
      throw new NotFoundError(taskId);
    }
    return { ...task };
  }

  /**
   * Returns a defensive copy of the pool record for the given id.
   * The returned object is safe for callers to mutate without affecting the board.
   * Throws if no pool is registered under that id.
   */
  public getPool(poolId: string): PoolRecord {
    const pool = this.poolsById.get(poolId);
    if (pool === undefined) {
      throw new NotFoundError(poolId);
    }
    return { ...pool };
  }

  /**
   * Computes the effective status for a single task.
   * The returned value reflects deps and the stored status; pools are not
   * addressed here since they have no exposed status enum.
   */
  public getTaskStatus(taskId: string): TaskEffectiveStatus {
    if (!this.tasksById.has(taskId)) {
      throw new NotFoundError(taskId);
    }
    return this.computeEffectiveStatus(taskId);
  }

  /**
   * Returns a snapshot of every task whose effective status is currently `open`.
   * Order matches insertion order; consumers should treat the array as immutable.
   * Useful as the answer to "what can I pick up right now?".
   */
  public getAvailableTasks(): TaskRecord[] {
    const result: TaskRecord[] = [];
    for (const task of this.tasksById.values()) {
      if (this.computeEffectiveStatus(task.id) === 'open') {
        result.push({ ...task });
      }
    }
    return result;
  }

  /**
   * Returns shallow copies of every task on the board in insertion order.
   * Use the entity-shape APIs (getTaskStatus, etc.) for derived information.
   * Mutating the returned objects has no effect on internal state.
   */
  public listTasks(): TaskRecord[] {
    return Array.from(this.tasksById.values(), (task) => ({ ...task }));
  }

  /**
   * Returns shallow copies of every pool on the board in insertion order.
   * Mutating the returned objects has no effect on internal state.
   */
  public listPools(): PoolRecord[] {
    return Array.from(this.poolsById.values(), (pool) => ({ ...pool }));
  }

  /**
   * Returns every dependency edge currently registered on the board.
   * Ordering follows the order in which edges were added.
   */
  public listDependencies(): DependencyRecord[] {
    return this.graph.listEdges();
  }

  /**
   * Subscribes a listener to task-status events.
   * The returned function removes the listener when invoked.
   * Listeners fire synchronously after the mutation that produced them.
   */
  public subscribe(listener: TaskBoardListener): TaskBoardUnsubscribe {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private requireUniqueId(id: string): void {
    if (this.tasksById.has(id) || this.poolsById.has(id)) {
      throw new DuplicateIdError(id);
    }
  }

  private requirePool(id: string): void {
    if (!this.poolsById.has(id)) {
      throw new NotFoundError(id);
    }
  }

  private requireKnown(id: string): void {
    if (!this.tasksById.has(id) && !this.poolsById.has(id)) {
      throw new NotFoundError(id);
    }
  }

  private validateDependency(fromId: string, toId: string): void {
    this.requireKnown(fromId);
    this.requireKnown(toId);
    if (fromId === toId) {
      throw new SelfDependencyError(fromId);
    }
    if (this.graph.parentOf(fromId) !== this.graph.parentOf(toId)) {
      throw new SiblingViolationError(fromId, toId);
    }
    if (this.graph.wouldCreateCycle(fromId, toId)) {
      throw new CycleError(fromId, toId);
    }
  }

  private requireValidTransition(taskId: string, current: TaskEffectiveStatus, requested: SettableTaskStatus): void {
    if (current === 'success' || current === 'failure') {
      throw new InvalidStatusTransitionError(taskId, current, requested);
    }
    if (current === 'blocked' && (requested === 'working' || requested === 'waiting')) {
      throw new InvalidStatusTransitionError(taskId, current, requested);
    }
  }

  private applyDependencies(fromId: string, targetIds: string[]): void {
    for (const toId of targetIds) {
      this.validateDependency(fromId, toId);
      if (!this.graph.hasEdge(fromId, toId)) {
        this.graph.addEdge(fromId, toId);
      }
    }
  }

  private isResolved(id: string): boolean {
    if (this.tasksById.has(id)) {
      const stored = this.storedStatusByTaskId.get(id) as TaskStoredStatus;
      return stored === 'success' || stored === 'failure';
    }
    if (!this.poolsById.has(id)) {
      return false;
    }
    let hasChild = false;
    for (const childId of this.graph.childrenOf(id)) {
      hasChild = true;
      if (!this.isResolved(childId)) {
        return false;
      }
    }
    return hasChild;
  }

  private computeEffectiveStatus(taskId: string): TaskEffectiveStatus {
    const stored = this.storedStatusByTaskId.get(taskId) as TaskStoredStatus;
    if (stored === 'success' || stored === 'failure') {
      return stored;
    }
    if (stored === 'working' || stored === 'waiting') {
      return stored;
    }
    return this.isAnyDependencyUnresolved(taskId) ? 'blocked' : 'open';
  }

  private isAnyDependencyUnresolved(id: string): boolean {
    let cursor: ParentId = id;
    while (cursor !== null) {
      for (const target of this.graph.outgoingOf(cursor)) {
        if (!this.isResolved(target)) {
          return true;
        }
      }
      cursor = this.graph.parentOf(cursor);
    }
    return false;
  }

  private snapshotTaskStatuses(): EffectiveStatusMap {
    const snapshot = new Map<string, TaskEffectiveStatus>();
    for (const taskId of this.tasksById.keys()) {
      snapshot.set(taskId, this.computeEffectiveStatus(taskId));
    }
    return snapshot;
  }

  private emitStatusChanges(previous: EffectiveStatusMap): void {
    if (this.listeners.length === 0) {
      return;
    }
    for (const taskId of this.tasksById.keys()) {
      const next = this.computeEffectiveStatus(taskId);
      const before = previous.get(taskId);
      if (before === undefined || before === next) {
        continue;
      }
      this.dispatchStatusEvent(taskId, before, next);
    }
  }

  private dispatchStatusEvent(taskId: string, previous: TaskEffectiveStatus, next: TaskEffectiveStatus): void {
    const event = { type: 'task-status-changed' as const, taskId, previous, next };
    for (const listener of [...this.listeners]) {
      listener(event);
    }
  }
}
