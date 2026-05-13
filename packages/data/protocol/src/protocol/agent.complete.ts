export interface AgentCompleteOperation {
  name: 'completeAgent';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
