import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { ParentLinkedTaskCapability } from '../../capability';

const schema = z.object({
  message: z.string().min(1).describe('Failure reason and any useful partial findings to send to the parent agent.'),
});

/**
 * Builds the native tool that fails a parent-linked task child.
 */
export function buildFailureTool(capability: ParentLinkedTaskCapability) {
  return new NativeTool({
    description: 'Fail the parent-linked task when it cannot be completed or you are stuck.',
    name: 'failure',
    schema,
  }).onInvoke(async (input) => capability.failure(input.message));
}
