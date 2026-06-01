import { LoadableRegistry } from '../../loadable';
import type { RealtimeOperationContext } from '../../types';
import type { AgentLivenessRecord } from './types';

/**
 * Wires the daemon's liveness broadcasts into the in-memory store. When
 * the daemon's boot id changes (process restarted), the registry is
 * dropped because every previous broadcast is now stale by definition.
 */
export function listenToAgentLiveness(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }
  client.listen('agentLiveness', (payload) => {
    // On a daemon restart (boot id changed) every previous broadcast is stale,
    // so start from an empty registry. Compute the base and patch exactly once
    // — the previous two-patch sequence relied on `patch` being synchronous to
    // read back the just-reset registry, and would have re-inserted stale rows
    // if it ever batched.
    const previousBootId = ctx.datastore.state.daemonBootId;
    const bootChanged = previousBootId !== null && previousBootId !== payload.daemonBootId;
    const base = bootChanged ? new LoadableRegistry<AgentLivenessRecord>() : ctx.datastore.state.agentLiveness;
    ctx.datastore.patch({
      agentLiveness: base.withItem(payload.agentId, payload, 'ready'),
      daemonBootId: payload.daemonBootId,
    });
  });
}
