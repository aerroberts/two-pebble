import type { RealtimeOperationContext } from '../types';

export function listDocumentsOperation(ctx: RealtimeOperationContext) {
  return async function listDocuments(payload: { limit?: number; offset?: number; projectId?: string } = {}) {
    if (ctx.datastore.state.documents.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ documents: ctx.datastore.state.documents.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listDocuments', {
        limit: payload.limit ?? 200,
        offset: payload.offset ?? 0,
        projectId: payload.projectId,
      });
      ctx.datastore.patch({ documents: ctx.datastore.state.documents.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ documents: ctx.datastore.state.documents.withStatus('error') });
      throw error;
    }
  };
}
