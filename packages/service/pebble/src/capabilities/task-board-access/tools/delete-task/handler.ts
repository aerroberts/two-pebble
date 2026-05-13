import { z } from 'zod/v4';
import type { TaskBoardRunner } from '../../../../agent';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';

const schema = z.object({
  taskId: z.string().describe('Task id to delete.'),
});

export function buildDeleteTaskTool(runner: TaskBoardRunner, boardId: string) {
  return new NativeTool({
    description:
      'Permanently deletes a task from the locked board. Dependencies pointing to or from this task are also removed.',
    name: 'delete-task',
    schema,
  }).onInvoke(async (input) => {
    await runner.deleteTask({ boardId, taskId: input.taskId });
    return ToolResponse.success([Cell.text(`Deleted ${input.taskId}.`)]);
  });
}
