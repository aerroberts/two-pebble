import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type FreshStartOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'freshStartAgent'>;
type Payload = FreshStartOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    await ctx.agentRegistry.freshStart(payload.agentId);
    return { agentId: payload.agentId };
  };
}
