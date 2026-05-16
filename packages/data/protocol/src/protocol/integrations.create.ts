import type { Integration } from '@two-pebble/datatypes';

type IntegrationCreateInput = Integration & {
  name: string;
};

/**
 * Defines the IntegrationsCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface IntegrationsCreateOperation {
  name: 'createIntegration';
  request: IntegrationCreateInput;
  response: {
    id: string;
  };
}
