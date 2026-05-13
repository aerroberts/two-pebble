export interface AgentCallRecordedEvent {
  name: 'agentCallRecorded';
  payload: {
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
