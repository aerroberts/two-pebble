import type { Logger } from '@two-pebble/logger';
import type {
  TaskBoardCreatePoolInput,
  TaskBoardCreateTaskInput,
  TaskBoardDeletePoolInput,
  TaskBoardDeleteTaskInput,
  TaskBoardDependencyInput,
  TaskBoardEventRecord,
  TaskBoardPoolNode,
  TaskBoardRenameTaskInput,
  TaskBoardRunner,
  TaskBoardSetTaskStatusInput,
  TaskBoardSnapshot,
  TaskBoardTaskNode,
  TaskBoardUpdateTaskDescriptionInput,
  TaskStatus,
} from '@two-pebble/pebble';
import type { DaemonBridge } from '../../types';
import type { TaskBoardService } from '../task-board-service';

interface DaemonTaskBoardRunnerContext {
  bridge: DaemonBridge;
  logger: Logger;
  taskBoards: TaskBoardService;
}

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

  public async renameTask(input: TaskBoardRenameTaskInput): Promise<void> {
    const record = await this.taskBoards.renameTask(input.taskId, input.name);
    const refreshed = await this.taskBoards.listTasks(record.boardId);
    for (const task of refreshed) this.bridge.emit('taskUpdated', task);
  }

  public async updateTaskDescription(input: TaskBoardUpdateTaskDescriptionInput): Promise<void> {
    const record = await this.taskBoards.updateTaskDescription(input.taskId, input.description);
    const refreshed = await this.taskBoards.listTasks(record.boardId);
    for (const task of refreshed) this.bridge.emit('taskUpdated', task);
  }

  public async setTaskStatus(input: TaskBoardSetTaskStatusInput): Promise<void> {
    const { result, events } = await this.taskBoards.setTaskStatus(input.boardId, {
      id: input.taskId,
      status: input.status,
      reason: input.reason,
    });
    this.broadcastEvents(events);
    this.bridge.emit('taskUpdated', result);
    const refreshed = await this.taskBoards.listTasks(input.boardId);
    for (const task of refreshed) this.bridge.emit('taskUpdated', task);
  }

  public async deleteTask(input: TaskBoardDeleteTaskInput): Promise<void> {
    const events = await this.taskBoards.deleteTask(input.boardId, input.taskId);
    this.broadcastEvents(events);
    this.bridge.emit('taskDeleted', { id: input.taskId, boardId: input.boardId });
    const refreshed = await this.taskBoards.listTasks(input.boardId);
    for (const task of refreshed) this.bridge.emit('taskUpdated', task);
  }

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

  public async deletePool(input: TaskBoardDeletePoolInput): Promise<void> {
    const events = await this.taskBoards.deletePool(input.boardId, input.poolId);
    this.broadcastEvents(events);
    this.bridge.emit('taskPoolDeleted', { id: input.poolId, boardId: input.boardId });
  }

  public async addDependency(input: TaskBoardDependencyInput): Promise<void> {
    const { result, events } = await this.taskBoards.createDependency({
      boardId: input.boardId,
      fromId: input.fromTaskId,
      toId: input.toTaskId,
    });
    this.broadcastEvents(events);
    this.bridge.emit('taskDependencyUpdated', result);
  }

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

  public async listTaskEvents(_boardId: string, taskId: string): Promise<TaskBoardEventRecord[]> {
    const events = await this.taskBoards.listTaskEvents(taskId);
    return events.map((event) => this.toRunnerEvent(event));
  }

  private broadcastEvents(events: { taskId: string }[]): void {
    for (const event of events) {
      try {
        this.bridge.emit('taskEventRecorded', event as never);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn('task event broadcast failed', { taskId: event.taskId, error: message });
      }
    }
  }

  private toRunnerEvent(event: {
    id: string;
    kind: string;
    taskId: string;
    reason: string;
    createdAt: number;
    status?: string;
    agentId?: string;
    agentName?: string;
  }): TaskBoardEventRecord {
    const kind = event.kind === 'delegated' || event.kind === 'undelegated' ? event.kind : 'status';
    return {
      id: event.id,
      kind,
      taskId: event.taskId,
      reason: event.reason,
      createdAt: event.createdAt,
      ...(event.status === undefined ? {} : { status: event.status as TaskStatus }),
      ...(event.agentId === undefined ? {} : { agentId: event.agentId }),
      ...(event.agentName === undefined ? {} : { agentName: event.agentName }),
    };
  }
}

function toPool(record: { id: string; name: string; parentPoolId: string | null }): TaskBoardPoolNode {
  return { id: record.id, name: record.name, parentPoolId: record.parentPoolId };
}

function toTask(record: {
  id: string;
  name: string;
  description: string;
  poolId: string | null;
  status: string;
  effectiveStatus: string;
  ownerId: string | null;
}): TaskBoardTaskNode {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    poolId: record.poolId,
    status: record.status as TaskStatus,
    effectiveStatus: record.effectiveStatus as TaskStatus | 'blocked',
    ownerId: record.ownerId,
  };
}
