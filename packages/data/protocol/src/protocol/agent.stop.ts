export interface AgentStopOperation {
  name: 'stopAgent';
  request: {
    agentId: string;
    reason?: string;
  };
  response: {
    agentId: string;
  };
}
