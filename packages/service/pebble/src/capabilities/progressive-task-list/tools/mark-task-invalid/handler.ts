import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { ProgressiveTaskListCapability } from '../../capability';

const schema = z.object({
  taskId: z.string(),
  reason: z.string(),
});

export function buildMarkTaskInvalidTool(capability: ProgressiveTaskListCapability) {
  return new NativeTool({
    description: 'Marks a progressive task as invalid or impossible.',
    name: 'mark-task-invalid',
    schema,
  }).onInvoke(async (input) => {
    try {
      capability.completeTaskUnsuccessfully(input.taskId, input.reason);
      await capability.mirrorStatusToDocument({ taskId: input.taskId, status: 'invalid' });
      return ToolResponse.success([Cell.text(`Marked ${input.taskId} invalid.`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(message)]);
    }
  });
}
