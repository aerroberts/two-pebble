import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListAgentTracesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listAgentTraces'>;
type ListAgentTracesPayload = ListAgentTracesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListAgentTracesPayload) {
    return ctx.datastore.agent.traces.list({
      agentId: payload.agentId,
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
    });
  };
}
