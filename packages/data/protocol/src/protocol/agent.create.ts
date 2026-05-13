export interface AgentCreateOperation {
  name: 'createAgent';
  request: {
    description: string;
    name: string;
    parentAgentId?: string | null;
  };
  response: {
    id: string;
  };
}
