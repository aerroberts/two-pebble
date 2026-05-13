import type { RealtimeOperationContext } from '../types';

export function listRepositoriesOperation(ctx: RealtimeOperationContext) {
  return async function listRepositories() {
    if (ctx.datastore.state.repositories.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ repositories: ctx.datastore.state.repositories.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listRepositories', { limit: 50, offset: 0 });
      ctx.datastore.patch({ repositories: ctx.datastore.state.repositories.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ repositories: ctx.datastore.state.repositories.withStatus('error') });
      throw error;
    }
  };
}
