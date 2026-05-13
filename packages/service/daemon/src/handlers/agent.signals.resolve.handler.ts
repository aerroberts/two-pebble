import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'resolveAgentSignal'>;
type OperationPayload = Operation['request'];
type OperationResponse = Operation['response'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: OperationPayload): Promise<OperationResponse> {
    const signal = await ctx.datastore.agent.signals.resolve(payload);
    await ctx.agentRegistry.wakeIfSignalsReady(payload.agentId);
    return { signal };
  };
}
