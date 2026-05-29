import type { RealtimeOperationContext } from '../types';

export function listMemoriesOperation(ctx: RealtimeOperationContext) {
  return async function listMemories(payload: { limit?: number; offset?: number; projectId?: string } = {}) {
    if (ctx.datastore.state.memories.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ memories: ctx.datastore.state.memories.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listMemories', {
        limit: payload.limit ?? 200,
        offset: payload.offset ?? 0,
        projectId: payload.projectId,
      });
      ctx.datastore.patch({ memories: ctx.datastore.state.memories.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ memories: ctx.datastore.state.memories.withStatus('error') });
      throw error;
    }
  };
}
