import { LoadableRegistry } from '../../loadable';
import type { ThirdPartyAgentInstallRecord, ThirdPartyAgentInstallsState } from './types';

export function createThirdPartyAgentInstallsState(): ThirdPartyAgentInstallsState {
  return {
    thirdPartyAgentInstalls: new LoadableRegistry<ThirdPartyAgentInstallRecord>(),
  };
}
