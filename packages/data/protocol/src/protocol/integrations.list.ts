import type { Integration } from '@two-pebble/datatypes';

type IntegrationRecord = Integration & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

export interface IntegrationsListOperation {
  name: 'listIntegrations';
  request: {
    limit?: number;
    offset?: number;
  };
  response: {
    items: IntegrationRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
