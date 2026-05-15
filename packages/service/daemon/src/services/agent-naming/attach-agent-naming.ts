import type { Datastore } from '@two-pebble/datastore';
import type { Agent, PebbleJsonValue } from '@two-pebble/pebble';
import { PebbleAgent } from '@two-pebble/pebble';
import { AgentNamingCapability, installCapabilityRunners } from '@two-pebble/pebble/capabilities';
import type { DaemonBridge } from '../../types';
import { DaemonAgentNamingRunner } from './daemon-agent-naming-runner';

interface AttachAgentNamingInput {
  agent: Agent;
  agentId: string;
  datastore: Datastore;
  multicastBridge: DaemonBridge;
  /**
   * Fresh launches register the capability so it initializes state.
   * Rehydrated launches re-create the same capability via `hydrate` so
   * the runtime tool is re-exposed without re-running initialization.
   */
  mode: 'fresh' | 'rehydrate';
}

/**
 * Auto-attaches the `agent-naming` capability to every Pebble agent
 * along with the daemon-side `AgentNamingRunner` that performs the
 * actual datastore rename. Framework agents are skipped — they rename
 * themselves through the `peb agent set-name` CLI instead.
 *
 * The capability is installed outside the registry-configured capability
 * list so users never have to remember to add it; every Pebble agent
 * gets the `set-agent-name` tool exposed for free at launch and after
 * rehydrate.
 */
export function attachAgentNaming(input: AttachAgentNamingInput): void {
  if (!(input.agent instanceof PebbleAgent)) {
    return;
  }
  installCapabilityRunners(input.agent, {
    agentNaming: new DaemonAgentNamingRunner({
      agentId: input.agentId,
      datastore: input.datastore,
      multicastBridge: input.multicastBridge,
    }),
  });
  const capability = new AgentNamingCapability();
  const config: Record<string, never> = {};
  if (input.mode === 'fresh') {
    input.agent.registerCapability(capability, config);
    return;
  }
  input.agent.hydrateCapability(capability, config, new Map<string, PebbleJsonValue>());
}
