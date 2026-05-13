import type { RealtimeOperationContext } from '../types';

export function updateThirdPartyAgentInstallOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('updateThirdPartyAgentInstall');
}
