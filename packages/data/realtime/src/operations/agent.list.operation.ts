import type { RealtimeOperationContext } from '../types';

export function listAgentsOperation(ctx: RealtimeOperationContext) {
  // De-duplicate concurrent fetches per scope, not on the shared collection
  // status. The old `status === 'loading'` guard was global, so a fetch for one
  // project that was still in flight made a near-simultaneous fetch for a
  // *different* project bail out and never load — leaving that view permanently
  // empty (#139). Keying by the requested project lets distinct scopes load
  // concurrently while still collapsing duplicate in-flight requests for the
  // same scope.
  const inFlight = new Set<string>();
  return async function listAgents(input: { projectId?: string } = {}) {
    const scopeKey = input.projectId ?? '';
    if (inFlight.has(scopeKey)) {
      return;
    }
    inFlight.add(scopeKey);
    ctx.datastore.patch({ agents: ctx.datastore.state.agents.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listAgents', { limit: 50, offset: 0, projectId: input.projectId });
      // Merge by id so a per-project fetch does not clobber agents owned by
      // another project sharing this registry.
      ctx.datastore.patch({ agents: ctx.datastore.state.agents.withMergedReadyItems(result.items) });
      return result;
    } catch (error) {
      ctx.datastore.patch({ agents: ctx.datastore.state.agents.withStatus('error') });
      throw error;
    } finally {
      inFlight.delete(scopeKey);
    }
  };
}
