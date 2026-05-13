import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type StopAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'stopAgent'>;
type Payload = StopAgentOperation['request'];

interface StoppableAgent {
  stop(reason: string): Promise<void>;
}

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const agent = ctx.agentRegistry.get(payload.agentId);
    if (agent === undefined) {
      throw new Error(`agent "${payload.agentId}" is not active`);
    }
    const reason = payload.reason ?? 'user stop';
    if ('stop' in agent && typeof agent.stop === 'function') {
      await (agent as typeof agent & StoppableAgent).stop(reason);
    } else {
      const updated = await ctx.datastore.agent.setStatus({ id: payload.agentId, status: 'idle' });
      ctx.multicastBridge.emit('agentRecorded', updated);
    }
    ctx.agentRegistry.deactivate(payload.agentId);
    return { agentId: payload.agentId };
  };
}
