import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallRecord = ThirdPartyAgentInstall & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

export interface ThirdPartyAgentInstallsUpdatedEvent {
  name: 'thirdPartyAgentInstallUpdated';
  payload: ThirdPartyAgentInstallRecord;
}
