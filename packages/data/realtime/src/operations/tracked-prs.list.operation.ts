import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function listTrackedPrsOperation(ctx: RealtimeOperationContext) {
  return async function listTrackedPrs(input: RealtimeEmitPayload<'listTrackedPrs'> = {}) {
    ctx.datastore.patch({ trackedPrs: ctx.datastore.state.trackedPrs.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listTrackedPrs', input);
      let next = ctx.datastore.state.trackedPrs.withStatus('ready');
      for (const item of result.items) {
        next = next.withItem(item.id, item, 'ready');
      }
      ctx.datastore.patch({ trackedPrs: next });
      return result;
    } catch (error) {
      ctx.datastore.patch({ trackedPrs: ctx.datastore.state.trackedPrs.withStatus('error') });
      throw error;
    }
  };
}
