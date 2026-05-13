export interface AgentRegistriesDeletedEvent {
  name: 'agentRegistryDeleted';
  payload: {
    id: string;
  };
}
