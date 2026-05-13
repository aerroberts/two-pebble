export interface AgentFreshStartOperation {
  name: 'freshStartAgent';
  request: {
    agentId: string;
  };
  response: {
    agentId: string;
  };
}
