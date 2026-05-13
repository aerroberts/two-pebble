import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallCreateInput = ThirdPartyAgentInstall & {
  name: string;
};

export interface ThirdPartyAgentInstallsCreateOperation {
  name: 'createThirdPartyAgentInstall';
  request: ThirdPartyAgentInstallCreateInput;
  response: {
    id: string;
  };
}
