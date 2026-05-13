import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListThirdPartyAgentInstallsOperation = ProtocolOpByName<
  ProtocolInboundOps<DaemonProtocol>,
  'listThirdPartyAgentInstalls'
>;
type ListThirdPartyAgentInstallsPayload = ListThirdPartyAgentInstallsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListThirdPartyAgentInstallsPayload) {
    const result = await ctx.datastore.thirdPartyAgentInstalls.list({
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
    });

    return result;
  };
}
