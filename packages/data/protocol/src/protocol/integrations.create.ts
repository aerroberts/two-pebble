import type { Integration } from '@two-pebble/datatypes';

type IntegrationCreateInput = Integration & {
  name: string;
};

export interface IntegrationsCreateOperation {
  name: 'createIntegration';
  request: IntegrationCreateInput;
  response: {
    id: string;
  };
}
