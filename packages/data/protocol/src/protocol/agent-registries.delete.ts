/**
 * Defines the AgentRegistriesDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentRegistriesDeleteOperation {
  name: 'deleteAgentRegistry';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
