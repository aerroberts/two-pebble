import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ResumeAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'resumeAgent'>;
type Payload = ResumeAgentOperation['request'];

/**
 * Flips an interrupted agent's durable status back to `idle` so the UI can
 * message it again. No rehydration happens here — the next inbound message
 * goes through the standard rehydrate path, which gates on `idle` /
 * `waiting`. Calling resume on a non-interrupted agent is a no-op.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.datastore.agent.read({ id: payload.id });
    if (record.status !== 'interrupted') {
      return { id: payload.id };
    }
    const updated = await ctx.datastore.agent.setStatus({ id: payload.id, status: 'idle' });
    ctx.multicastBridge.emit('agentRecorded', updated);
    return { id: payload.id };
  };
}
