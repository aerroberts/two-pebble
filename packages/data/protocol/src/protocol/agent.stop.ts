/**
 * Defines the AgentStopOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentStopOperation {
  name: 'stopAgent';
  request: {
    agentId: string;
    reason?: string;
  };
  response: {
    agentId: string;
  };
}
