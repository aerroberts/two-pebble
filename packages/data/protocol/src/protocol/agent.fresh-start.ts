/**
 * Defines the AgentFreshStartOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentFreshStartOperation {
  name: 'freshStartAgent';
  request: {
    agentId: string;
  };
  response: {
    agentId: string;
  };
}
