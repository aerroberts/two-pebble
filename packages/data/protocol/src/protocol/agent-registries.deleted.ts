/**
 * Defines the AgentRegistriesDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentRegistriesDeletedEvent {
  name: 'agentRegistryDeleted';
  payload: {
    id: string;
  };
}
