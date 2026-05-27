import type { RealtimeOperationContext } from '../types';

export function listKnownIdesOperation(ctx: RealtimeOperationContext) {
  return async function listKnownIdes() {
    if (ctx.datastore.state.knownIdes.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ knownIdes: ctx.datastore.state.knownIdes.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listKnownIdes', {});
      ctx.datastore.patch({ knownIdes: ctx.datastore.state.knownIdes.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ knownIdes: ctx.datastore.state.knownIdes.withStatus('error') });
      throw error;
    }
  };
}
