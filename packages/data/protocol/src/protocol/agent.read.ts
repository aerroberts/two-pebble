/**
 * Defines the AgentReadOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentReadOperation {
  name: 'readAgent';
  request: {
    id: string;
  };
  response: {
    agentRegistryId: string | null;
    completedAt: number;
    description: string;
    id: string;
    metadata: string;
    name: string;
    startedAt: number;
    status: 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
    workspaceId: string;
  };
}
