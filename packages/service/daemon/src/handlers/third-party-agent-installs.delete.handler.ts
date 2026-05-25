import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteThirdPartyAgentInstallOperation = ProtocolOpByName<
  ProtocolInboundOps<DaemonProtocol>,
  'deleteThirdPartyAgentInstall'
>;
type DeleteThirdPartyAgentInstallPayload = DeleteThirdPartyAgentInstallOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteThirdPartyAgentInstallPayload) {
    const deleted = await ctx.datastore.thirdPartyAgentInstalls.delete({ id: payload.id });

    ctx.events.emit('thirdPartyAgentInstallDeleted', deleted);

    return deleted;
  };
}
