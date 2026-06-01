import type { DeleteDocumentInput } from '../states/documents/types';
import type { RealtimeOperationContext } from '../types';

export function deleteDocumentOperation(ctx: RealtimeOperationContext) {
  return async function deleteDocument(payload: DeleteDocumentInput) {
    const existing = ctx.datastore.state.documents.getItem(payload.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        documents: ctx.datastore.state.documents.withItem(payload.id, existing, 'loading'),
      });
    }

    try {
      const deleted = await ctx.datastore.emit('deleteDocument', payload);
      ctx.datastore.patch({ documents: ctx.datastore.state.documents.withoutItem(payload.id) });
      return deleted;
    } catch (error) {
      // Revert the optimistic `loading` status against the CURRENT value, not
      // the pre-await snapshot: if a `documentUpdated` push landed during the
      // await, restoring `existing` would clobber it with stale content.
      const current = ctx.datastore.state.documents.getItem(payload.id)?.value;
      const restore = current ?? existing;
      if (restore !== undefined && restore !== null) {
        ctx.datastore.patch({
          documents: ctx.datastore.state.documents.withItem(payload.id, restore, 'ready'),
        });
      }
      throw error;
    }
  };
}
