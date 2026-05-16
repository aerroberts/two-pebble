import type { Integration } from '@two-pebble/datatypes';

type IntegrationRecord = Integration & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

/**
 * Defines the IntegrationsUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface IntegrationsUpdatedEvent {
  name: 'integrationUpdated';
  payload: IntegrationRecord;
}
