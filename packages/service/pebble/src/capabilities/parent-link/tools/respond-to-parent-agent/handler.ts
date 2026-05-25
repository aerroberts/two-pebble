import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { ParentLinkCapability } from '../../capability';

const schema = z.object({
  message: z.string().min(1).describe('Response to send back to the parent agent.'),
});

/**
 * Builds the native tool that answers a pending parent question.
 */
export function buildRespondToParentAgentTool(capability: ParentLinkCapability) {
  return new NativeTool({
    description: 'Respond to the parent agent.',
    name: 'respond-to-parent-agent',
    schema,
  }).onInvoke(async (input) => capability.respondToParent(input.message));
}
