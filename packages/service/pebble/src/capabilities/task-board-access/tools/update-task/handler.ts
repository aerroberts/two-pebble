import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';

const schema = z.object({
  boardId: z.string().optional().describe('Task board id. Omit to use the active board.'),
  taskId: z.string().min(1).describe('Task id to update.'),
  name: z.string().optional().describe('Optional replacement task name.'),
  description: z.string().optional().describe('Optional replacement task description.'),
  status: z.enum(['working', 'waiting', 'success', 'failure']).optional().describe('Optional replacement status.'),
  reason: z.string().optional().describe('Required when status is provided.'),
});

/**
 * Builds the native tool that updates one or more task fields.
 */
export function buildUpdateTaskTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description:
      'Update a task on the active board. Provide any combination of name, description, and status (with reason); omitted fields are left unchanged.',
    name: 'update-task',
    schema,
  }).onInvoke(async (input) => {
    const boardId = capability.boardId(input.boardId);
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
      await capability.bridge.taskBoards.renameTask({ taskId: input.taskId, name: input.name });
      updated.push('name');
    }
    if (input.description !== undefined) {
      await capability.bridge.taskBoards.updateTaskDescription({
        boardId,
        taskId: input.taskId,
        description: input.description,
      });
      updated.push('description');
    }
    if (input.status !== undefined && input.reason !== undefined) {
      await capability.bridge.taskBoards.setTaskStatus({
        boardId,
        taskId: input.taskId,
        status: input.status,
        reason: input.reason,
      });
      updated.push(`status=${input.status}`);
    }
    return ToolResponse.success([Cell.text(`Updated ${input.taskId} (${updated.join(', ')}).`)]);
  });
}
