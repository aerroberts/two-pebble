import type { RealtimeOperationContext } from '../types';

export function listTrackedPrsOperation(ctx: RealtimeOperationContext) {
  return async function listTrackedPrs(input: {
    agentId?: string;
    taskId?: string;
    state?: Array<'mergeable' | 'pending' | 'unmergeable' | 'merged' | 'closed'>;
    limit?: number;
    offset?: number;
  }) {
    const result = await ctx.datastore.emit('listTrackedPrs', input);
    // Tracked PRs are listed per task/agent into one shared registry, so a
    // full-collection replace would drop every other scope's PRs (the cause of
    // PR status glyphs disappearing across the board). Merge by id instead;
    // server-side removals arrive via push events.
    ctx.datastore.patch({ trackedPrs: ctx.datastore.state.trackedPrs.withMergedReadyItems(result.items) });
    return result;
  };
}
