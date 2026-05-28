export interface AgentQueuedMessageCancelOperation {
  name: 'cancelAgentQueuedMessage';
  request: {
    id: string;
  };
  response: {
    deleted: boolean;
    id: string;
  };
}
