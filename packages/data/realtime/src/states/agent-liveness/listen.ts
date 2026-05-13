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
    const previousBootId = ctx.datastore.state.daemonBootId;
    if (previousBootId !== null && previousBootId !== payload.daemonBootId) {
      ctx.datastore.patch({
        agentLiveness: new LoadableRegistry<AgentLivenessRecord>(),
        daemonBootId: payload.daemonBootId,
      });
    }
    ctx.datastore.patch({
      agentLiveness: ctx.datastore.state.agentLiveness.withItem(payload.agentId, payload, 'ready'),
      daemonBootId: payload.daemonBootId,
    });
  });
}
