/**
 * Bridges Pebble agents to whatever owns their persisted identity (the
 * daemon in production). When a Pebble agent's `set-agent-name` tool
 * fires, the runner is what actually mutates the durable name.
 *
 * Capabilities discover the runner through `getCapabilityRunners`; if no
 * runner is installed (tests, isolated agents) the tool reports a
 * graceful error rather than crashing the agent.
 */
export interface AgentNamingRunner {
  setName(name: string): Promise<void>;
}
