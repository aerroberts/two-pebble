import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type FailAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'failAgent'>;
type FailAgentPayload = FailAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: FailAgentPayload) {
    // Only `waiting` agents are eligible for the administrative
    // stop-and-mark-failed action. Other states already have their own
    // transitions (running → stop, idle → unchanged, terminal → no-op),
    // and the UI only surfaces the action on a waiting agent — but the
    // backend enforces it too so a stale UI state can't flip a running
    // or idle agent through this path.
    const existing = await ctx.datastore.agent.read({ id: payload.id });
    if (existing.status !== 'waiting') {
      throw new Error(
        `Agent "${existing.name || existing.id}" is ${existing.status}; only waiting agents can be marked failed.`,
      );
    }
    ctx.agentRegistry.deactivate(payload.id);
    const record = await ctx.datastore.agent.fail(payload);
    ctx.events.emit('agentRecorded', record);
    return { id: record.id };
  };
}
