import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
});

/**
 * Builds the native tool that explains child replies arrive as signals.
 */
export function buildReadSubAgentMessagesTool(capability: SubAgentCapability) {
  return new NativeTool({
    description:
      "Returns nothing useful. Awaited responses from children arrive automatically as 'Sub-agent Response' context cells - you do not have to poll. Listed only for completeness.",
    name: 'read-sub-agent-messages',
    schema,
  }).onInvoke((input) => capability.readSubAgentMessages(input));
}
