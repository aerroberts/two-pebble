import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { ProgressiveTaskListCapability } from '../../progressive-task-list-capability';

const schema = z.object({
  taskId: z.string(),
  reason: z.string().optional(),
});

export function buildMarkTaskCompleteTool(capability: ProgressiveTaskListCapability) {
  return new NativeTool({
    description: 'Marks a progressive task as completed.',
    name: 'mark-task-complete',
    schema,
  }).onInvoke((input) => {
    try {
      capability.completeTaskSuccessfully(input.taskId, input.reason);
      return ToolResponse.success([Cell.text(`Marked ${input.taskId} complete.`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(message)]);
    }
  });
}
