import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { TaskLifecycleCapability } from '../../capability';

const schema = z.object({
  reason: z.string().optional().describe('Optional completion summary.'),
});

/**
 * Builds the native tool that marks the assigned task successful.
 */
export function buildCompleteTaskTool(capability: TaskLifecycleCapability) {
  return new NativeTool({
    description: 'Mark the assigned task as successfully complete.',
    name: 'complete-task',
    schema,
  }).onInvoke(async (input) => capability.completeTask(input.reason));
}
