import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type SendAgentQueuedMessageNowOperation = ProtocolOpByName<
  ProtocolInboundOps<DaemonProtocol>,
  'sendAgentQueuedMessageNow'
>;
type Payload = SendAgentQueuedMessageNowOperation['request'];

/**
 * Dispatches one queued message immediately without waiting for the agent idle queue.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    return ctx.queuedMessages.dispatchNow(payload.id);
  };
}
