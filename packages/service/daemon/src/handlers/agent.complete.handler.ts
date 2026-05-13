import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CompleteAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'completeAgent'>;
type CompleteAgentPayload = CompleteAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CompleteAgentPayload) {
    const record = await ctx.datastore.agent.complete(payload);
    ctx.multicastBridge.emit('agentRecorded', record);
    return { id: record.id };
  };
}
