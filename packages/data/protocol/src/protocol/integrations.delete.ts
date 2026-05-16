/**
 * Defines the IntegrationsDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface IntegrationsDeleteOperation {
  name: 'deleteIntegration';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
