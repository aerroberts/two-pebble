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
      if (existing !== undefined && existing !== null) {
        ctx.datastore.patch({
          documents: ctx.datastore.state.documents.withItem(payload.id, existing, 'ready'),
        });
      }
      throw error;
    }
  };
}
