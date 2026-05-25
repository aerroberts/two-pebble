import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({
  names: z.array(z.string().min(1)).min(1).describe('Parent-assigned child names to wait for.'),
});

/**
 * Builds the native tool that waits for named child results.
 */
export function buildWaitForAgentsTool(capability: SubAgentCapability) {
  return new NativeTool({
    description: 'Wait until every named child agent has produced a new result.',
    name: 'wait-for-agents',
    schema,
  }).onInvoke(async (input) => capability.waitForAgents(input));
}
