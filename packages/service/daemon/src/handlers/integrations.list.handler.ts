import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListIntegrationsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listIntegrations'>;
type ListIntegrationsPayload = ListIntegrationsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListIntegrationsPayload) {
    const result = await ctx.datastore.integrations.list({
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
    });

    return result;
  };
}
