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
  };
}
