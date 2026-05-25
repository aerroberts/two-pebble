import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
  message: z.string().min(1).describe('Response to send to the child agent.'),
});

/**
 * Builds the native tool that answers a child agent question.
 */
export function buildRespondToChildAgentTool(capability: SubAgentCapability) {
  return new NativeTool({
    description: 'Respond to a child agent that asked this parent a question.',
    name: 'respond-to-child-agent',
    schema,
  }).onInvoke(async (input) => capability.respondToChildAgent(input));
}
