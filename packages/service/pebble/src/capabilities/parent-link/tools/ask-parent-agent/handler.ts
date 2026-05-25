import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { ParentLinkCapability } from '../../capability';

const schema = z.object({
  message: z.string().min(1).describe('Question to ask the parent agent.'),
});

/**
 * Builds the native tool that asks the parent agent and waits for a reply.
 */
export function buildAskParentAgentTool(capability: ParentLinkCapability) {
  return new NativeTool({
    description: 'Ask the parent agent a question and wait for its reply.',
    name: 'ask-parent-agent',
    schema,
  }).onInvoke((input) => capability.askParent(input.message));
}
