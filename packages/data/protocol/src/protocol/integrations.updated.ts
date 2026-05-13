import type { Integration } from '@two-pebble/datatypes';

type IntegrationRecord = Integration & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

export interface IntegrationsUpdatedEvent {
  name: 'integrationUpdated';
  payload: IntegrationRecord;
}
