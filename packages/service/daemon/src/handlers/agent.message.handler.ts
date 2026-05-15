import { Cell } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { resolveDocumentReferenceCells } from './resolve-document-reference-cells';

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
    const rawCells =
      payload.cells !== undefined && payload.cells.length > 0 ? payload.cells : [Cell.text(payload.message)];
    const cells = await resolveDocumentReferenceCells({
      cells: rawCells,
      datastore: ctx.datastore,
      logger: ctx.logger,
    });
    const live = ctx.agentRegistry.get(payload.agentId);
    if (live !== undefined) {
      live.sendMessage(cells);
      return { id: payload.agentId };
    }
    const record = await ctx.datastore.agent.read({ id: payload.agentId });
    if (record.status === 'running') {
      await ctx.agentRegistry.interrupt(payload.agentId, 'message requested running agent without active runtime');
      throw new Error(`Agent "${payload.agentId}" was interrupted and cannot be resumed automatically.`);
    }
    if (record.status === 'interrupted') {
      throw new Error(`Agent "${payload.agentId}" was interrupted and cannot be resumed automatically.`);
    }
    if (record.status === 'offline' || record.status === 'failed') {
      throw new Error(`Agent "${payload.agentId}" is ${record.status} and cannot receive messages.`);
    }
    void ctx.agentRegistry
      .rehydrate(payload.agentId)
      .then((agent) => {
        agent.sendMessage(cells);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        ctx.logger.warn('agent message rehydration failed', { agentId: payload.agentId, error: message });
      });
    return { id: payload.agentId };
  };
}
