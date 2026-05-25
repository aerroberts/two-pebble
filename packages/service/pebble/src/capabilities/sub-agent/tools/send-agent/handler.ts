import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({
  instructions: z.string().min(1).describe('Follow-up instructions or message for the child agent.'),
  name: z.string().min(1).describe('Parent-assigned child name.'),
});

/**
 * Builds the native tool that sends a one-way child-agent message.
 */
export function buildSendAgentTool(capability: SubAgentCapability) {
  return new NativeTool({
    description: 'Send follow-up instructions to an existing named child agent.',
    name: 'send-agent',
    schema,
  }).onInvoke(async (input) => capability.sendAgent(input));
}
