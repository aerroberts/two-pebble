export interface AgentFailOperation {
  name: 'failAgent';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
