export interface IntegrationsDeletedEvent {
  name: 'integrationDeleted';
  payload: {
    id: string;
  };
}
