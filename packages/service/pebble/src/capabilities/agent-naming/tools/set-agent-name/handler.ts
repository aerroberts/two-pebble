import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { AgentNamingCapability } from '../../capability';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Provide a non-empty name.')
    .max(64, 'Names should be 2-4 words. Keep this under 64 characters.'),
});

/**
 * Builds the native tool that lets a Pebble agent rename its own durable
 * agent record through the installed agent bridge.
 */
export function buildSetAgentNameTool(capability: AgentNamingCapability) {
  return new NativeTool({
    description:
      'Set a short descriptive name for this agent (2-4 words, title case). Call once at the start of the conversation.',
    name: 'set-agent-name',
    schema,
  }).onInvoke(async (input) => {
    try {
      await capability.bridge.agent.setName({ name: input.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to set name: ${message}`)]);
    }
    return ToolResponse.success([Cell.text(`Agent name set to "${input.name}".`)]);
  });
}
