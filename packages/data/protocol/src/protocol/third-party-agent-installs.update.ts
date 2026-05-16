import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallUpdateInput = ThirdPartyAgentInstall & {
  id: string;
  name: string;
};

/**
 * Defines the ThirdPartyAgentInstallsUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThirdPartyAgentInstallsUpdateOperation {
  name: 'updateThirdPartyAgentInstall';
  request: ThirdPartyAgentInstallUpdateInput;
  response: {
    id: string;
  };
}
