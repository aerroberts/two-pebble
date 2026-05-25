import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
  message: z.string().min(1).describe('Question to ask the child agent.'),
});

/**
 * Builds the native tool that asks an existing child agent for a reply.
 */
export function buildAskSubAgentTool(capability: SubAgentCapability) {
  return new NativeTool({
    description:
      "Ask an existing child agent for a reply. Wakes the child (if it is currently idle after a prior reply) and waits for its next response. The response arrives as a 'Sub-agent Response' context cell in a future turn - until then, no new response exists. Use this for follow-up rounds on the same child.",
    name: 'ask-sub-agent',
    schema,
  }).onInvoke(async (input) => capability.askSubAgent(input));
}
