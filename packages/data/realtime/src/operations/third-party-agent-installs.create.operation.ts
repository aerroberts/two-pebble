import type { CreateThirdPartyAgentInstallInput } from '../states/third-party-agent-installs/types';
import type { RealtimeOperationContext } from '../types';

export function createThirdPartyAgentInstallOperation(ctx: RealtimeOperationContext) {
  return async function createThirdPartyAgentInstall(payload: CreateThirdPartyAgentInstallInput) {
    return ctx.datastore.emit('createThirdPartyAgentInstall', payload);
  };
}
