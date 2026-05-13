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
