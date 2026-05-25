import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
  message: z.string().min(1).describe('Message to send to the child agent.'),
});

/**
 * Builds the native tool that sends a one-way parent-to-child message.
 */
export function buildSendSubAgentMessageTool(capability: SubAgentCapability) {
  return new NativeTool({
    description:
      'Send a one-way message to a child agent. The child receives it but is NOT required to respond. Do NOT use this when you actually need a reply - use ask-sub-agent instead.',
    name: 'send-sub-agent-message',
    schema,
  }).onInvoke(async (input) => capability.sendSubAgentMessage(input));
}
