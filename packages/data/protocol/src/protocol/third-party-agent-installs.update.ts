import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallUpdateInput = ThirdPartyAgentInstall & {
  id: string;
  name: string;
};

export interface ThirdPartyAgentInstallsUpdateOperation {
  name: 'updateThirdPartyAgentInstall';
  request: ThirdPartyAgentInstallUpdateInput;
  response: {
    id: string;
  };
}
