import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';

const schema = z.object({
  taskId: z.string().describe('Task id to update.'),
  description: z.string().describe('New description text. Replaces the prior value in full.'),
});

export function buildUpdateTaskDescriptionTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description: "Replaces a task's description on the locked board.",
    name: 'update-task-description',
    schema,
  }).onInvoke(async (input) => {
    await capability.bridge().updateTaskDescription({
      boardId: capability.boardId(undefined),
      taskId: input.taskId,
      description: input.description,
    });
    return ToolResponse.success([
      Cell.text(`Updated description for ${input.taskId} (${input.description.length} chars).`),
    ]);
  });
}
