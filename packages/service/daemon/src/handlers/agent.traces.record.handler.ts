import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type RecordAgentTraceOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'recordAgentTrace'>;
type RecordAgentTracePayload = RecordAgentTraceOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: RecordAgentTracePayload) {
    const record = await ctx.datastore.agent.traces.record(payload);
    ctx.multicastBridge.emit('agentTraceRecorded', record);
    return { id: record.id };
  };
}
