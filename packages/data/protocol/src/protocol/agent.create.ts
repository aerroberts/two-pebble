/**
 * Defines the AgentCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentCreateOperation {
  name: 'createAgent';
  request: {
    description: string;
    name: string;
    parentAgentId?: string | null;
    projectId?: string;
  };
  response: {
    id: string;
  };
}
