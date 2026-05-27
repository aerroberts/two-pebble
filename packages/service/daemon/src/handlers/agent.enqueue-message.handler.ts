import { logger } from '@two-pebble/logger';
import { Cell } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { resolveReferenceCells } from './resolve-document-reference-cells';

type EnqueueAgentMessageOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'enqueueAgentMessage'>;
type Payload = EnqueueAgentMessageOperation['request'];

/**
 * Persists a follow-up message for delivery the next time an agent becomes idle.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const agent = await ctx.datastore.agent.read({ id: payload.agentId });
    if (agent.status === 'failed' || agent.status === 'offline') {
      throw new Error(`Agent "${payload.agentId}" is ${agent.status}.`);
    }
    const rawCells =
      payload.cells !== undefined && payload.cells.length > 0 ? payload.cells : [Cell.text(payload.message ?? '')];
    const cells = await resolveReferenceCells({
      cells: rawCells,
      datastore: ctx.datastore,
      logger,
    });
    const row = await ctx.datastore.agent.queuedMessages.enqueue({ agentId: payload.agentId, cells });
    ctx.events.emit('agentQueuedMessageChanged', row);
    if (agent.status === 'idle') {
      void ctx.queuedMessages.tryDispatch(payload.agentId);
    }
    return { id: row.id };
  };
}
