export interface AgentCallsReadOperation {
  name: 'readAgentCall';
  request: {
    id: string;
  };
  response: {
    agentId: string;
    completedAt: number;
    data: object;
    errorMessage: string;
    id: string;
    modelId: string;
    provider: string;
    startedAt: number;
    status: 'in_progress' | 'completed' | 'failed';
    threadCellPointer: string;
  };
}
