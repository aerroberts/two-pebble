import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { TaskLifecycleCapability } from '../../capability';

const schema = z.object({
  reason: z.string().min(1).describe('Why the assigned task cannot be completed.'),
});

/**
 * Builds the native tool that marks the assigned task failed.
 */
export function buildFailTaskTool(capability: TaskLifecycleCapability) {
  return new NativeTool({
    description: 'Mark the assigned task as failed. Use only when the task cannot be completed.',
    name: 'fail-task',
    schema,
  }).onInvoke(async (input) => capability.failTask(input.reason));
}
