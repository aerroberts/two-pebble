import type { RealtimeOperationContext } from '../types';

export function listHeartbeatsOperation(ctx: RealtimeOperationContext) {
  return async function listHeartbeats() {
    if (ctx.datastore.state.heartbeats.status === 'loading') {
      return;
    }
    ctx.datastore.patch({ heartbeats: ctx.datastore.state.heartbeats.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listHeartbeats', { limit: 100, offset: 0 });
      ctx.datastore.patch({ heartbeats: ctx.datastore.state.heartbeats.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ heartbeats: ctx.datastore.state.heartbeats.withStatus('error') });
      throw error;
    }
  };
}
