import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateIntegrationOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createIntegration'>;
type CreateIntegrationPayload = CreateIntegrationOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(data: CreateIntegrationPayload) {
    const integration = await ctx.datastore.integrations.create(data);

    ctx.events.emit('integrationUpdated', integration);

    return { id: integration.id };
  };
}
