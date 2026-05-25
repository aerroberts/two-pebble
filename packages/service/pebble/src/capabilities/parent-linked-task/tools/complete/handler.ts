import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { ParentLinkedTaskCapability } from '../../capability';

const schema = z.object({
  message: z.string().min(1).describe('Final successful result to send to the parent agent.'),
});

/**
 * Builds the native tool that completes a parent-linked task child.
 */
export function buildCompleteTool(capability: ParentLinkedTaskCapability) {
  return new NativeTool({
    description: 'Complete the parent-linked task and send the final result to the parent.',
    name: 'complete',
    schema,
  }).onInvoke(async (input) => capability.complete(input.message));
}
