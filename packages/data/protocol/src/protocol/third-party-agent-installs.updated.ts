import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallRecord = ThirdPartyAgentInstall & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

/**
 * Defines the ThirdPartyAgentInstallsUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThirdPartyAgentInstallsUpdatedEvent {
  name: 'thirdPartyAgentInstallUpdated';
  payload: ThirdPartyAgentInstallRecord;
}
