import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallCreateInput = ThirdPartyAgentInstall & {
  name: string;
};

/**
 * Defines the ThirdPartyAgentInstallsCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThirdPartyAgentInstallsCreateOperation {
  name: 'createThirdPartyAgentInstall';
  request: ThirdPartyAgentInstallCreateInput;
  response: {
    id: string;
  };
}
