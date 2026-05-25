import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
  reason: z.string().min(1).describe('Why the child agent should be stopped.'),
});

/**
 * Builds the native tool that permanently stops a child agent.
 */
export function buildKillSubAgentTool(capability: SubAgentCapability) {
  return new NativeTool({
    description:
      'Stop a child agent. Use only when you want to permanently abandon a child - once stopped it cannot be resumed. Spawn a fresh child to continue similar work.',
    name: 'kill-sub-agent',
    schema,
  }).onInvoke(async (input) => capability.killSubAgent(input));
}
