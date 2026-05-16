/**
 * Defines the AgentCallRecordedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
