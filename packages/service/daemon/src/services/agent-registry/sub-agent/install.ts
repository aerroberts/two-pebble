import type { Agent } from '@two-pebble/pebble';
import type { CapabilitySpec } from '../register-pebble-capabilities';
import { attachFreshPebbleCapabilities } from '../register-pebble-capabilities';

interface InstallFreshAgentInput {
  agent: Agent;
  specs: CapabilitySpec[];
}

export function installFreshLaunchAgent(input: InstallFreshAgentInput): void {
  attachFreshPebbleCapabilities({ agent: input.agent, capabilities: input.specs });
}
