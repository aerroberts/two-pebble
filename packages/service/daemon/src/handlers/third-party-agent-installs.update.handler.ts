import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateThirdPartyAgentInstallOperation = ProtocolOpByName<
  ProtocolInboundOps<DaemonProtocol>,
  'updateThirdPartyAgentInstall'
>;
type UpdateThirdPartyAgentInstallPayload = UpdateThirdPartyAgentInstallOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(data: UpdateThirdPartyAgentInstallPayload) {
    const install = await ctx.datastore.thirdPartyAgentInstalls.update(data);

    ctx.events.emit('thirdPartyAgentInstallUpdated', install);

    return { id: install.id };
  };
}
