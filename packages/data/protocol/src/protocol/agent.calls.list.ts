/**
 * Defines the AgentCallsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentCallsListOperation {
  name: 'listAgentCalls';
  request: {
    agentId: string;
    limit: number;
    offset: number;
  };
  response: {
    items: {
      agentId: string;
      completedAt: number;
      errorMessage: string;
      id: string;
      modelId: string;
      provider: string;
      startedAt: number;
      status: 'in_progress' | 'completed' | 'failed';
      threadCellPointer: string;
    }[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
