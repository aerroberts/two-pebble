import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';

const schema = z.object({});

/**
 * Builds the native tool that lists configured and spawned sub-agents.
 */
export function buildListSubAgentsTool(capability: SubAgentCapability) {
  return new NativeTool({
    description: 'List configured sub-agent reference names and spawned child agent ids.',
    name: 'list-sub-agents',
    schema,
  }).onInvoke(() => capability.listSubAgents(capability.references()));
}
