import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateThirdPartyAgentInstallOperation = ProtocolOpByName<
  ProtocolInboundOps<DaemonProtocol>,
  'createThirdPartyAgentInstall'
>;
type CreateThirdPartyAgentInstallPayload = CreateThirdPartyAgentInstallOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(data: CreateThirdPartyAgentInstallPayload) {
    const install = await ctx.datastore.thirdPartyAgentInstalls.create(data);

    ctx.multicastBridge.emit('thirdPartyAgentInstallUpdated', install);

    return { id: install.id };
  };
}
