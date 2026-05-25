import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildCreateTaskTool } from './tools/create-task/handler';
import { buildDescribeTaskBoardTool } from './tools/describe-task-board/handler';
import { buildListTasksTool } from './tools/list-tasks/handler';
import { buildSetTaskStatusTool } from './tools/set-task-status/handler';
import { buildUpdateTaskTool } from './tools/update-task/handler';
import type { TaskBoardAccessCapabilityConfig } from './utils/task-board-access-types';

/**
 * Capability that exposes task-board operations to a Pebble agent.
 * It delegates all state changes to the installed task-board bridge and
 * renders board snapshots as compact text for model context.
 */
export class TaskBoardAccessCapability extends AgentCapability<TaskBoardAccessCapabilityConfig> {
  public readonly id = 'task-board-access';
  public readonly description = 'Lets an agent read and update task boards.';
  private readonly boardIdSlot = this.useState<string>('boardId', '');

  /**
   * Stores the default board id from capability config and injects the active
   * board id into the conversation context so it appears alongside the system
   * prompt for every future turn.
   *
   * Only runs on fresh launches; rehydration replays the persisted context
   * cells instead of calling initialize again.
   */
  public override initialize(config: TaskBoardAccessCapabilityConfig): void {
    if (typeof config.boardId === 'string') {
      this.boardIdSlot.set(config.boardId);
    }
    const boardId = this.boardIdSlot.value;
    if (boardId.length === 0) {
      return;
    }
    this.agent.addUserContext('Task Board Context', [
      Cell.header2('Task Board Context'),
      Cell.text(`Active task board: ${boardId}. Tool calls default to this board when boardId is omitted.`),
    ]);
  }

  /**
   * Registers task-board tools for describe, create, and status updates.
   * The tools are intentionally thin wrappers around the daemon-owned
   * operations so durable board state stays in one place.
   */
  public override hookOnRegister(_config: TaskBoardAccessCapabilityConfig) {
    return {
      system: systemPrompt,
      tools: [
        buildDescribeTaskBoardTool(this),
        buildCreateTaskTool(this),
        buildSetTaskStatusTool(this),
        buildListTasksTool(this),
        buildUpdateTaskTool(this),
      ],
    };
  }
  public boardId(input: string | undefined): string {
    const boardId = input ?? this.boardIdSlot.value;
    if (boardId.length === 0) {
      throw new Error('boardId is required.');
    }
    return boardId;
  }
}
