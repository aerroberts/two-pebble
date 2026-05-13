import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface ThirdPartyAgentInstallsState {
  thirdPartyAgentInstalls: LoadableRegistry<ThirdPartyAgentInstallRecord>;
}

export type CreateThirdPartyAgentInstallInput = RealtimeEmitPayload<'createThirdPartyAgentInstall'>;
export type UpdateThirdPartyAgentInstallInput = RealtimeEmitPayload<'updateThirdPartyAgentInstall'>;
export type ThirdPartyAgentInstallRecord = RealtimeEmitResponse<'listThirdPartyAgentInstalls'>['items'][number];
export type ThirdPartyAgentInstallData = ThirdPartyAgentInstallRecord['data'];
export type ThirdPartyAgentInstallFrameworkId = ThirdPartyAgentInstallRecord['frameworkId'];
