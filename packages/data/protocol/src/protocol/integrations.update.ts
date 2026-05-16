import type { Integration } from '@two-pebble/datatypes';

type IntegrationUpdateInput = Integration & {
  id: string;
  name: string;
};

/**
 * Defines the IntegrationsUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface IntegrationsUpdateOperation {
  name: 'updateIntegration';
  request: IntegrationUpdateInput;
  response: {
    id: string;
  };
}
