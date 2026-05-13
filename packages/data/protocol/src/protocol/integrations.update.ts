import type { Integration } from '@two-pebble/datatypes';

type IntegrationUpdateInput = Integration & {
  id: string;
  name: string;
};

export interface IntegrationsUpdateOperation {
  name: 'updateIntegration';
  request: IntegrationUpdateInput;
  response: {
    id: string;
  };
}
