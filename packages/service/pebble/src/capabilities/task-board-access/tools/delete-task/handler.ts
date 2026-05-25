import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';

const schema = z.object({
  taskId: z.string().describe('Task id to delete.'),
});

export function buildDeleteTaskTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description:
      'Permanently deletes a task from the locked board. Dependencies pointing to or from this task are also removed.',
    name: 'delete-task',
    schema,
  }).onInvoke(async (input) => {
    await capability.bridge().deleteTask({ boardId: capability.boardId(undefined), taskId: input.taskId });
    return ToolResponse.success([Cell.text(`Deleted ${input.taskId}.`)]);
  });
}
