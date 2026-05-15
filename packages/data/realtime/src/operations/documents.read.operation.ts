import type { ReadDocumentInput } from '../states/documents/types';
import type { RealtimeOperationContext } from '../types';

export function readDocumentOperation(ctx: RealtimeOperationContext) {
  return async function readDocument(payload: ReadDocumentInput) {
    const existing = ctx.datastore.state.documents.getItem(payload.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        documents: ctx.datastore.state.documents.withItem(payload.id, existing, 'loading'),
      });
    }

    try {
      const document = await ctx.datastore.emit('readDocument', payload);
      ctx.datastore.patch({
        documents: ctx.datastore.state.documents.withItem(document.id, document, 'ready'),
      });
      return document;
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
