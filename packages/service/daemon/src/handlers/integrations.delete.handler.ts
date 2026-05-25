import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteIntegrationOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteIntegration'>;
type DeleteIntegrationPayload = DeleteIntegrationOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteIntegrationPayload) {
    const deleted = await ctx.datastore.integrations.delete({ id: payload.id });

    ctx.events.emit('integrationDeleted', deleted);

    return deleted;
  };
}
