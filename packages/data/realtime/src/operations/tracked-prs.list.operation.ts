import type { RealtimeOperationContext } from '../types';

export function listTrackedPrsOperation(ctx: RealtimeOperationContext) {
  return async function listTrackedPrs(input: {
    agentId?: string;
    taskId?: string;
    state?: Array<'mergeable' | 'unmergeable' | 'merged' | 'closed'>;
    limit?: number;
    offset?: number;
  }) {
    const result = await ctx.datastore.emit('listTrackedPrs', input);
    ctx.datastore.patch({ trackedPrs: ctx.datastore.state.trackedPrs.withReadyItems(result.items) });
    return result;
  };
}
