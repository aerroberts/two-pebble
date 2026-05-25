import type { Agent } from '../agent/agent';
import type { AgentBridge } from '../agent/agent-bridge';

export function installAgentBridge(agent: Agent, bridge: AgentBridge): void {
  agent.installBridge(bridge);
}

export function getAgentBridge(agent: Agent): AgentBridge {
  return agent.getBridge();
}

export const installCapabilityRunners = installAgentBridge;
export const getCapabilityRunners = getAgentBridge;
