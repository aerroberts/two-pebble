import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { ParentLinkedTeammateCapability } from '../../capability';

const schema = z.object({
  message: z.string().min(1).describe('Response, result, or status update to send to the parent agent.'),
});

/**
 * Builds the native tool that responds to the parent and sleeps.
 */
export function buildRespondParentTool(capability: ParentLinkedTeammateCapability) {
  return new NativeTool({
    description: 'Respond to the parent agent and sleep until the parent sends another message.',
    name: 'respond-parent',
    schema,
  }).onInvoke(async (input) => capability.respondParent(input.message));
}
