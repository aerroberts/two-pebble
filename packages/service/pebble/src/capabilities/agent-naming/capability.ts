import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';

const setAgentNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Provide a non-empty name.')
    .max(64, 'Names should be 2–4 words. Keep this under 64 characters.'),
});

/**
 * Auto-attached to every Pebble agent at launch and rehydrate. Exposes a
 * single `set-agent-name` native tool so the model can rename its own
 * agent record exactly once at the start of a conversation, mirroring the
 * CLI flow framework agents use. The actual rename is forwarded to the
 * daemon through an installed `AgentNamingRunner`; the capability stays
 * runtime-only because the user never configures it directly.
 */
export class AgentNamingCapability extends AgentCapability<Record<string, never>> {
  public readonly id = 'agent-naming';
  public readonly description = 'Lets the agent rename itself via a tool call.';

  public override hookOnRegister() {
    return {
      tools: [
        new NativeTool({
          description:
            'Set a short descriptive name for this agent (2–4 words, title case). Call once at the start of the conversation.',
          name: 'set-agent-name',
          schema: setAgentNameSchema,
        }).onInvoke(async (input) => {
          const runner = getCapabilityRunners(this.agent).agentNaming;
          if (runner === undefined) {
            const message = 'Agent naming runner is not installed for this agent.';
            return ToolResponse.error(message, [Cell.text(message)]);
          }
          try {
            await runner.setName(input.name);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return ToolResponse.error(message, [Cell.text(`Failed to set name: ${message}`)]);
          }
          return ToolResponse.success([Cell.text(`Agent name set to "${input.name}".`)]);
        }),
      ],
    };
  }
}
