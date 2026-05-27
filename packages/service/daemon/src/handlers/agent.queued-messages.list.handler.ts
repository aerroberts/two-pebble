import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListAgentQueuedMessagesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listAgentQueuedMessages'>;
type Payload = ListAgentQueuedMessagesOperation['request'];

/**
 * Lists queued-message records for UI inspection.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    return ctx.datastore.agent.queuedMessages.listForAgent(payload);
  };
}
