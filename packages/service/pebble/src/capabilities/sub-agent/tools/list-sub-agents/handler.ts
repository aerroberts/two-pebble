import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';
import type { SubAgentReference } from '../../utils/sub-agent-types';

const schema = z.object({});

/**
 * Builds the native tool that lists configured and spawned sub-agents.
 */
export function buildListSubAgentsTool(capability: SubAgentCapability, references: SubAgentReference[]) {
  return new NativeTool({
    description: 'List configured sub-agent reference names and spawned child agent ids.',
    name: 'list-sub-agents',
    schema,
  }).onInvoke(() => capability.listSubAgents(references));
}
