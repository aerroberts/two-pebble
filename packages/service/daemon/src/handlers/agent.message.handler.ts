import { Cell } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type SendAgentMessageOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'sendAgentMessage'>;
type Payload = SendAgentMessageOperation['request'];

/**
 * Accepts a follow-up message and routes it to the agent. If the agent is
 * not live, the rehydration is kicked off in the background and the message
 * is delivered once rehydration resolves — never block the WS op on a
 * potentially-slow rehydration, because a long block can cause the socket
 * to time out and clear realtime state on reconnect. The agent's listeners
 * are wired through the daemon-owned multicast bridge so trace broadcasts
 * always reach every connected client regardless of which path rehydrated.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const cell = Cell.text(payload.message);
    const live = ctx.agentRegistry.get(payload.agentId);
    if (live !== undefined) {
      live.sendMessage([cell]);
      return { id: payload.agentId };
    }
    void ctx.agentRegistry
      .rehydrate(payload.agentId)
      .then((agent) => {
        agent.sendMessage([cell]);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        ctx.logger.warn('agent message rehydration failed', { agentId: payload.agentId, error: message });
      });
    return { id: payload.agentId };
  };
}
