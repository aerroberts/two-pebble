/**
 * Defines the AgentListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentListOperation {
  name: 'listAgents';
  request: {
    limit: number;
    offset: number;
  };
  response: {
    items: {
      agentRegistryId: string | null;
      completedAt: number;
      description: string;
      id: string;
      metadata: string;
      name: string;
      startedAt: number;
      status: 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
    }[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
