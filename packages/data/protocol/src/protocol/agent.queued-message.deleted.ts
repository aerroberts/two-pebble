export interface AgentQueuedMessageDeletedEvent {
  name: 'agentQueuedMessageDeleted';
  payload: {
    id: string;
  };
}
