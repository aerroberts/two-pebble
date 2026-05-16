/**
 * Defines the AgentCompleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentCompleteOperation {
  name: 'completeAgent';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
