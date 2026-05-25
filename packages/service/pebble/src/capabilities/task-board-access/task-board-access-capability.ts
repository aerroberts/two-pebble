import { NativeTool, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';
import taskDescriptionGuidancePrompt from './prompts/task-description-guidance.md?raw';
import {
  boardSchema,
  createTaskSchema,
  listTasksSchema,
  setStatusSchema,
  updateTaskSchema,
} from './tools/task-board-access-schemas';
import { renderBoardTree, renderTaskList } from './utils/describe-board';
import type { TaskBoardAccessCapabilityConfig } from './utils/task-board-access-types';

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
   * Stores the default board id from capability config and injects the active
   * board id into the conversation context so it appears alongside the system
   * prompt for every future turn. The same context cell carries guidance that
   * encourages longer, more nuanced task descriptions so the model produces
   * useful task records when creating or updating tasks via this capability.
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
      Cell.text(taskDescriptionGuidancePrompt),
    ]);
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
        new NativeTool({
          description: 'List every task on a task board with id, name, status, and pool.',
          name: 'list-tasks',
          schema: listTasksSchema,
        }).onInvoke(async (input) => {
          const snapshot = await this.runner().describeBoard(this.boardId(input.boardId));
          return ToolResponse.success([Cell.codeBlock('text', renderTaskList(snapshot.tasks))]);
        }),
        new NativeTool({
          description:
            'Update a task on the active board. Provide any combination of name, description, and status (with reason); omitted fields are left unchanged.',
          name: 'update-task',
          schema: updateTaskSchema,
        }).onInvoke(async (input) => {
          const boardId = this.boardId(input.boardId);
          const updated: string[] = [];
          if (input.status !== undefined && input.reason === undefined) {
            return ToolResponse.error('A reason is required when updating status.', [
              Cell.text('Provide a `reason` whenever `status` is set.'),
            ]);
          }
          if (input.name === undefined && input.description === undefined && input.status === undefined) {
            return ToolResponse.error('Nothing to update.', [
              Cell.text('Provide at least one of name, description, or status.'),
            ]);
          }
          if (input.name !== undefined) {
            await this.runner().renameTask({ taskId: input.taskId, name: input.name });
            updated.push('name');
          }
          if (input.description !== undefined) {
            await this.runner().updateTaskDescription({
              boardId,
              taskId: input.taskId,
              description: input.description,
            });
            updated.push('description');
          }
          if (input.status !== undefined && input.reason !== undefined) {
            await this.runner().setTaskStatus({
              boardId,
              taskId: input.taskId,
              status: input.status,
              reason: input.reason,
            });
            updated.push(`status=${input.status}`);
          }
          return ToolResponse.success([Cell.text(`Updated ${input.taskId} (${updated.join(', ')}).`)]);
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
