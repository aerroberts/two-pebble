/**
 * Defines the IntegrationsDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface IntegrationsDeletedEvent {
  name: 'integrationDeleted';
  payload: {
    id: string;
  };
}
