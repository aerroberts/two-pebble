export interface AgentRegistriesDeleteOperation {
  name: 'deleteAgentRegistry';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
