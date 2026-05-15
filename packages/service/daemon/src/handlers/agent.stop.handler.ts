import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type StopAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'stopAgent'>;
type Payload = StopAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const reason = payload.reason ?? 'user stop';
    const active = ctx.agentRegistry.get(payload.agentId);
    if (active === undefined) {
      throw new Error(`agent "${payload.agentId}" is not active`);
    }
    await ctx.agentRegistry.stopManual(payload.agentId, reason);
    return { agentId: payload.agentId };
  };
}
