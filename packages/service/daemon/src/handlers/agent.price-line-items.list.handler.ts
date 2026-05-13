import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListAgentPriceLineItemsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listAgentPriceLineItems'>;
type ListAgentPriceLineItemsPayload = ListAgentPriceLineItemsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListAgentPriceLineItemsPayload) {
    return ctx.datastore.agent.priceLineItems.list({ agentId: payload.agentId });
  };
}
