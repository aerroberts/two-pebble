import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListAgentCallsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listAgentCalls'>;
type ListAgentCallsPayload = ListAgentCallsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListAgentCallsPayload) {
    return ctx.datastore.agent.calls.list({
      agentId: payload.agentId,
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
    });
  };
}
