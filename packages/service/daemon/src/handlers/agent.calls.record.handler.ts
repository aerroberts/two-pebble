import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type RecordAgentCallOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'recordAgentCall'>;
type RecordAgentCallPayload = RecordAgentCallOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: RecordAgentCallPayload) {
    const record = await ctx.datastore.agent.calls.record(payload);
    ctx.events.emit('agentCallRecorded', record);
    return { id: record.id };
  };
}
