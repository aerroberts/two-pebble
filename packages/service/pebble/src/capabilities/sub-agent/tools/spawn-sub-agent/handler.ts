import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { SubAgentCapability } from '../../capability';
import spawnSubAgentMessagePrompt from '../../prompts/spawn-message-field.md?raw';
import { spawnToolDescription } from '../../utils/sub-agent-references';
import type { SubAgentReference } from '../../utils/sub-agent-types';

const schema = (references: SubAgentReference[]) =>
  z.object({
    referenceName: referenceNameSchema(references),
    message: z.string().describe(spawnSubAgentMessagePrompt),
  });

/**
 * Builds the native tool that spawns a configured child agent.
 */
export function buildSpawnSubAgentTool(capability: SubAgentCapability, references: SubAgentReference[]) {
  return new NativeTool({
    description: spawnToolDescription(references),
    name: 'spawn-sub-agent',
    schema: schema(references),
  }).onInvoke(async (input) => capability.spawnSubAgent(input));
}

function referenceNameSchema(references: SubAgentReference[]) {
  const names = references.map((reference) => reference.name);
  if (names.length === 0) {
    return z.string().describe('Configured sub-agent reference name.');
  }
  return z.enum(names as [string, ...string[]]).describe('Configured sub-agent reference name.');
}
