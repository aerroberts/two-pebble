import type { RealtimeOperationContext } from '../types';

/**
 * Fetches the daemon's PR overview read-model and replaces the `prOverview`
 * registry (one entry per board). This is a single project-wide aggregate —
 * not a per-scope merge — so a full replace is correct. Concurrent calls for
 * the same scope are de-duped so the live refetch (driven by task/PR push
 * events) cannot stampede.
 */
export function listPrOverviewOperation(ctx: RealtimeOperationContext) {
  const inFlight = new Set<string>();
  return async function listPrOverview(input: { projectId?: string } = {}) {
    const scopeKey = input.projectId ?? '';
    if (inFlight.has(scopeKey)) {
      return;
    }
    inFlight.add(scopeKey);
    ctx.datastore.patch({ prOverview: ctx.datastore.state.prOverview.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listPrOverview', input);
      ctx.datastore.patch({
        prOverview: ctx.datastore.state.prOverview.withItems(
          result.boards.map((board) => ({ id: board.boardId, status: 'ready' as const, value: board })),
        ),
      });
      return result;
    } catch (error) {
      ctx.datastore.patch({ prOverview: ctx.datastore.state.prOverview.withStatus('error') });
      throw error;
    } finally {
      inFlight.delete(scopeKey);
    }
  };
}
