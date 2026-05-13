export interface AgentRecordedEvent {
  name: 'agentRecorded';
  payload: {
    agentRegistryId?: string | null;
    completedAt: number;
    description: string;
    id: string;
    metadata: string;
    name: string;
    parentAgentId?: string | null;
    startedAt: number;
    status: 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
  };
}
