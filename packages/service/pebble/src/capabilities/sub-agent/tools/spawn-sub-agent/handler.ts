import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';
import { describeSubAgentReferences } from '../../utils/sub-agent-references';
import type { SubAgentReference } from '../../utils/sub-agent-types';

const schema = (references: SubAgentReference[]) =>
  z.object({
    instructions: z.string().min(1).describe('Natural-language instructions for the child agent.'),
    mode: z
      .enum(['task', 'teammate'])
      .describe('Task children complete/fail once; teammate children can respond and resume later.'),
    name: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .describe('Unique short kebab-case name for this child.'),
    subAgentId: subAgentIdSchema(references).describe('Configured sub-agent id to launch.'),
    workspace: z
      .enum(['inherit', 'worktree'])
      .default('inherit')
      .describe(
        'Workspace isolation for the child. Use inherit for the same workspace as the parent; use worktree for a fresh sibling worktree.',
      ),
  });

/**
 * Builds the native tool that launches a named child agent.
 */
export function buildSpawnSubAgentTool(capability: SubAgentCapability) {
  const references = capability.references();
  return new NativeTool({
    description: `Launch a named child agent and send it initial instructions. ${describeSubAgentReferences(references)}`,
    name: 'spawn-sub-agent',
    schema: schema(references),
  }).onInvoke(async (input) => capability.spawnSubAgent(input));
}

function subAgentIdSchema(references: SubAgentReference[]) {
  const names = references.map((reference) => reference.name);
  if (names.length === 0) {
    return z.string();
  }
  return z.enum(names as [string, ...string[]]);
}
