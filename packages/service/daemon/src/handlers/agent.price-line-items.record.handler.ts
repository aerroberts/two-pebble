import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type RecordAgentPriceLineItemOperation = ProtocolOpByName<
  ProtocolInboundOps<DaemonProtocol>,
  'recordAgentPriceLineItem'
>;
type RecordAgentPriceLineItemPayload = RecordAgentPriceLineItemOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: RecordAgentPriceLineItemPayload) {
    const record = await ctx.datastore.agent.priceLineItems.record(payload);
    ctx.events.emit('agentPriceLineItemRecorded', record);
    return { id: record.id };
  };
}
