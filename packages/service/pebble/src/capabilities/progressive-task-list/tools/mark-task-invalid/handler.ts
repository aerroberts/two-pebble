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
  }).onInvoke((input) => {
    try {
      capability.completeTaskUnsuccessfully(input.taskId, input.reason);
      // Intentionally do NOT mirror status back into the bound document.
      // Document todos are immutable templates — the agent's "invalid"
      // verdict applies only to the in-memory progressive task list
      // mapped off those todos at launch time.
      return ToolResponse.success([Cell.text(`Marked ${input.taskId} invalid.`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(message)]);
    }
  });
}
