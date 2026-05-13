import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateIntegrationOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateIntegration'>;
type UpdateIntegrationPayload = UpdateIntegrationOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(data: UpdateIntegrationPayload) {
    const integration = await ctx.datastore.integrations.update(data);

    ctx.multicastBridge.emit('integrationUpdated', integration);

    return { id: integration.id };
  };
}
