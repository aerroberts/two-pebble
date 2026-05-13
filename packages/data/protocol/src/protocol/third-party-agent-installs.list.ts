import type { ThirdPartyAgentInstall } from '@two-pebble/datatypes';

type ThirdPartyAgentInstallRecord = ThirdPartyAgentInstall & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

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
