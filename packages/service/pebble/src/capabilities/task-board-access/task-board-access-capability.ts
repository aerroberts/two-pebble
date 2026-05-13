import { NativeTool, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';
import { renderBoardTree } from './describe-board';
import { boardSchema, createTaskSchema, setStatusSchema } from './task-board-access-schemas';
import type { TaskBoardAccessCapabilityConfig } from './task-board-access-types';

/**
 * Capability that exposes task-board operations to a Pebble agent.
 * It delegates all state changes to the installed task-board runner and
 * renders board snapshots as compact text for model context.
 */
export class TaskBoardAccessCapability extends AgentCapability<TaskBoardAccessCapabilityConfig> {
  public readonly id = 'task-board-access';
  public readonly description = 'Lets an agent read and update task boards.';
  private readonly boardIdSlot = this.useState<string>('boardId', '');

  /**
   * Stores the default board id from capability config.
   * Individual tool calls may override it, but a configured board keeps
   * model tool calls concise.
   */
  public override initialize(config: TaskBoardAccessCapabilityConfig): void {
    if (typeof config.boardId === 'string') {
      this.boardIdSlot.set(config.boardId);
    }
  }

  /**
   * Registers task-board tools for describe, create, and status updates.
   * The tools are intentionally thin wrappers around the daemon-owned
   * runner so durable board state stays in one place.
   */
  public override hookOnRegister(_config: TaskBoardAccessCapabilityConfig) {
    return {
      tools: [
        new NativeTool({
          description: 'Describe a task board.',
          name: 'describe-task-board',
          schema: boardSchema,
        }).onInvoke(async (input) => {
          const snapshot = await this.runner().describeBoard(this.boardId(input.boardId));
          return ToolResponse.success([Cell.codeBlock('text', renderBoardTree(snapshot))]);
        }),
        new NativeTool({
          description: 'Create a task on a task board.',
          name: 'create-task',
          schema: createTaskSchema,
        }).onInvoke(async (input) => {
          const result = await this.runner().createTask({
            boardId: this.boardId(input.boardId),
            name: input.name,
            ...(input.description === undefined ? {} : { description: input.description }),
            ...(input.poolId === undefined ? {} : { poolId: input.poolId }),
            ...(input.dependsOn === undefined ? {} : { dependsOn: input.dependsOn }),
          });
          return ToolResponse.success([Cell.text(`Created task ${result.id}.`)]);
        }),
        new NativeTool({
          description: 'Set a task status.',
          name: 'set-task-status',
          schema: setStatusSchema,
        }).onInvoke(async (input) => {
          await this.runner().setTaskStatus({ ...input, boardId: this.boardId(input.boardId) });
          return ToolResponse.success([Cell.text(`Set ${input.taskId} to ${input.status}.`)]);
        }),
      ],
    };
  }

  private runner() {
    const runner = getCapabilityRunners(this.agent).taskBoard;
    if (runner === undefined) {
      throw new Error('task-board runner is not installed.');
    }
    return runner;
  }

  private boardId(input: string | undefined): string {
    const boardId = input ?? this.boardIdSlot.value;
    if (boardId.length === 0) {
      throw new Error('boardId is required.');
    }
    return boardId;
  }
}
