import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CancelAgentQueuedMessageOperation = ProtocolOpByName<
  ProtocolInboundOps<DaemonProtocol>,
  'cancelAgentQueuedMessage'
>;
type Payload = CancelAgentQueuedMessageOperation['request'];

/**
 * Cancels a queued message before it is dispatched.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const result = await ctx.datastore.agent.queuedMessages.cancel(payload);
    if (result.deleted) {
      ctx.events.emit('agentQueuedMessageDeleted', { id: result.id });
    }
    return result;
  };
}
