import type { Logger } from '@two-pebble/logger';
import type {
  TaskBoardCreatePoolInput,
  TaskBoardCreateTaskInput,
  TaskBoardDeletePoolInput,
  TaskBoardDeleteTaskInput,
  TaskBoardDependencyInput,
  TaskBoardEventRecord,
  TaskBoardRenameTaskInput,
  TaskBoardRunner,
  TaskBoardSetTaskStatusInput,
  TaskBoardSnapshot,
  TaskBoardUpdateTaskDescriptionInput,
} from '@two-pebble/pebble';
import type { DaemonBridge } from '../../types';
import type { TaskBoardService } from '../task-board-service';
import { toPool, toRunnerEvent, toTask } from './daemon-task-board-runner-mapping';
import type { DaemonTaskBoardRunnerContext, TaskEventBroadcastRecord } from './daemon-task-board-runner-types';

/**
 * Daemon implementation of the `TaskBoardRunner` contract Pebble's
 * task-board-access capability uses. Every method delegates to the
 * shared `TaskBoardService` and fans the resulting events out through
 * the multicast bridge so connected UIs stay in sync with mutations the
 * agent makes through the capability tools.
 */
export class DaemonTaskBoardRunner implements TaskBoardRunner {
  private readonly bridge: DaemonBridge;
  private readonly logger: Logger;
  private readonly taskBoards: TaskBoardService;

  public constructor(context: DaemonTaskBoardRunnerContext) {
    this.bridge = context.bridge;
    this.logger = context.logger;
    this.taskBoards = context.taskBoards;
  }

  /**
   * Returns a full board snapshot in the Pebble capability shape.
   * Pools, tasks, and dependencies are read from the shared daemon service
   * so the agent sees the same state as connected UI clients.
   */
  public async describeBoard(boardId: string): Promise<TaskBoardSnapshot> {
    const snapshot = await this.taskBoards.readBoardSnapshot(boardId);
    return {
      boardId: snapshot.board.id,
      boardName: snapshot.board.name,
      pools: snapshot.pools.map(toPool),
      tasks: snapshot.tasks.map(toTask),
      dependencies: snapshot.dependencies.map((edge) => ({ fromId: edge.fromId, toId: edge.toId })),
    };
  }

  /**
   * Creates a task through the daemon board service.
   * Status events and the created task are broadcast so clients update
   * immediately after the capability call succeeds.
   */
  public async createTask(input: TaskBoardCreateTaskInput) {
    const { result, events } = await this.taskBoards.createTask({
      boardId: input.boardId,
      name: input.name,
      description: input.description ?? '',
      poolId: input.poolId ?? null,
      dependsOn: input.dependsOn ?? [],
    });
    this.broadcastEvents(events);
    this.bridge.emit('taskUpdated', result);
    return { id: result.id };
  }

  /**
   * Renames a task and refreshes every task on the board.
   * The refresh carries derived effective status back to listeners after
   * a metadata-only write.
   */
  public async renameTask(input: TaskBoardRenameTaskInput): Promise<void> {
    const record = await this.taskBoards.renameTask(input.taskId, input.name);
    const refreshed = await this.taskBoards.listTasks(record.boardId);
    for (const task of refreshed) {
      this.bridge.emit('taskUpdated', task);
    }
  }

  /**
   * Updates a task description and refreshes board task records.
   * The engine does not own descriptions, so the datastore row is the
   * source of truth for this operation.
   */
  public async updateTaskDescription(input: TaskBoardUpdateTaskDescriptionInput): Promise<void> {
    const record = await this.taskBoards.updateTaskDescription(input.taskId, input.description);
    const refreshed = await this.taskBoards.listTasks(record.boardId);
    for (const task of refreshed) {
      this.bridge.emit('taskUpdated', task);
    }
  }

  /**
   * Sets task status through the engine-backed daemon service.
   * Any status cascade events are broadcast before the refreshed task
   * snapshot is emitted.
   */
  public async setTaskStatus(input: TaskBoardSetTaskStatusInput): Promise<void> {
    const { result, events } = await this.taskBoards.setTaskStatus(input.boardId, {
      id: input.taskId,
      status: input.status,
      reason: input.reason,
    });
    this.broadcastEvents(events);
    this.bridge.emit('taskUpdated', result);
    const refreshed = await this.taskBoards.listTasks(input.boardId);
    for (const task of refreshed) {
      this.bridge.emit('taskUpdated', task);
    }
  }

  /**
   * Deletes a task from the board.
   * Broadcasts the delete event and then refreshes surviving tasks so
   * dependency-derived statuses stay current in clients.
   */
  public async deleteTask(input: TaskBoardDeleteTaskInput): Promise<void> {
    const events = await this.taskBoards.deleteTask(input.boardId, input.taskId);
    this.broadcastEvents(events);
    this.bridge.emit('taskDeleted', { id: input.taskId, boardId: input.boardId });
    const refreshed = await this.taskBoards.listTasks(input.boardId);
    for (const task of refreshed) {
      this.bridge.emit('taskUpdated', task);
    }
  }

  /**
   * Creates a task pool through the shared board service.
   * The persisted pool row is emitted directly after validation succeeds.
   */
  public async createPool(input: TaskBoardCreatePoolInput) {
    const record = await this.taskBoards.createPool({
      boardId: input.boardId,
      parentPoolId: input.parentPoolId ?? null,
      name: input.name,
      dependsOn: input.dependsOn ?? [],
    });
    this.bridge.emit('taskPoolUpdated', record);
    return { id: record.id };
  }

  /**
   * Deletes a pool after engine validation.
   * Any resulting task events are broadcast before the pool deletion event.
   */
  public async deletePool(input: TaskBoardDeletePoolInput): Promise<void> {
    const events = await this.taskBoards.deletePool(input.boardId, input.poolId);
    this.broadcastEvents(events);
    this.bridge.emit('taskPoolDeleted', { id: input.poolId, boardId: input.boardId });
  }

  /**
   * Adds a dependency edge between sibling board entities.
   * The daemon service validates the edge and returns any status cascade
   * events that need to be broadcast.
   */
  public async addDependency(input: TaskBoardDependencyInput): Promise<void> {
    const { result, events } = await this.taskBoards.createDependency({
      boardId: input.boardId,
      fromId: input.fromTaskId,
      toId: input.toTaskId,
    });
    this.broadcastEvents(events);
    this.bridge.emit('taskDependencyUpdated', result);
  }

  /**
   * Removes a dependency edge and broadcasts any unblock cascades.
   * The delete event carries the edge endpoints so clients can remove the
   * edge without refetching the full board.
   */
  public async deleteDependency(input: TaskBoardDependencyInput): Promise<void> {
    const events = await this.taskBoards.deleteDependency(input.boardId, {
      fromId: input.fromTaskId,
      toId: input.toTaskId,
    });
    this.broadcastEvents(events);
    this.bridge.emit('taskDependencyDeleted', {
      boardId: input.boardId,
      fromId: input.fromTaskId,
      toId: input.toTaskId,
    });
  }

  /**
   * Lists durable task events in the Pebble capability event shape.
   * The board id is accepted for interface compatibility; task id selects
   * the actual event stream.
   */
  public async listTaskEvents(_boardId: string, taskId: string): Promise<TaskBoardEventRecord[]> {
    const events = await this.taskBoards.listTaskEvents(taskId);
    return events.map((event) => toRunnerEvent(event));
  }

  private broadcastEvents(events: TaskEventBroadcastRecord[]): void {
    for (const event of events) {
      try {
        this.bridge.emit('taskEventRecorded', event as never);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn('task event broadcast failed', { taskId: event.taskId, error: message });
      }
    }
  }
}
