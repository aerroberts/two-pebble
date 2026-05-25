import type { AgentNamingBridge } from '../../agent';
import { getAgentBridge } from '../agent-bridge';
import { AgentCapability } from '../agent-capability';
import { buildSetAgentNameTool } from './tools/set-agent-name/handler';

/**
 * Auto-attached to every Pebble agent at launch and rehydrate. Exposes a
 * single `set-agent-name` native tool so the model can rename its own
 * agent record exactly once at the start of a conversation, mirroring the
 * CLI flow framework agents use. The actual rename is forwarded to the
 * daemon through the installed `AgentBridge`; the capability stays
 * runtime-only because the user never configures it directly.
 */
export class AgentNamingCapability extends AgentCapability<Record<string, never>> {
  public readonly id = 'agent-naming';
  public readonly description = 'Lets the agent rename itself via a tool call.';

  public override hookOnRegister() {
    return {
      tools: [buildSetAgentNameTool(this)],
    };
  }

  public bridge(): AgentNamingBridge | undefined {
    return getAgentBridge(this.agent).agentNaming;
  }
}
