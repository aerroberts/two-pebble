export interface IntegrationsDeleteOperation {
  name: 'deleteIntegration';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
