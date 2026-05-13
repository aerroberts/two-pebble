import { z } from 'zod/v4';
import type { TaskBoardRunner } from '../../../../agent';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';

const schema = z.object({
  taskId: z.string().describe('Task id to update.'),
  description: z.string().describe('New description text. Replaces the prior value in full.'),
});

export function buildUpdateTaskDescriptionTool(runner: TaskBoardRunner, boardId: string) {
  return new NativeTool({
    description: "Replaces a task's description on the locked board.",
    name: 'update-task-description',
    schema,
  }).onInvoke(async (input) => {
    await runner.updateTaskDescription({ boardId, taskId: input.taskId, description: input.description });
    return ToolResponse.success([
      Cell.text(`Updated description for ${input.taskId} (${input.description.length} chars).`),
    ]);
  });
}
