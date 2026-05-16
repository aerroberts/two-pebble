/**
 * Defines the AgentRecordedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
