import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallRecord = ThirdPartyAgentInstall & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

/**
 * Defines the ThirdPartyAgentInstallsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThirdPartyAgentInstallsListOperation {
  name: 'listThirdPartyAgentInstalls';
  request: {
    limit?: number;
    offset?: number;
  };
  response: {
    items: ThirdPartyAgentInstallRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
