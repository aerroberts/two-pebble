import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';

const schema = z.object({
  boardId: z.string().optional().describe('Task board id. Omit to use the active board.'),
  taskId: z.string().min(1).describe('Task id to update.'),
  status: z.enum(['working', 'waiting', 'success', 'failure']).describe('New task status.'),
  reason: z.string().min(1).describe('Why the status changed.'),
});

/**
 * Builds the native tool that sets a task status.
 */
export function buildSetTaskStatusTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description: 'Set a task status.',
    name: 'set-task-status',
    schema,
  }).onInvoke(async (input) => {
    await capability.bridge().setTaskStatus({ ...input, boardId: capability.boardId(input.boardId) });
    return ToolResponse.success([Cell.text(`Set ${input.taskId} to ${input.status}.`)]);
  });
}
