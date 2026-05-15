import type { UpdateDocumentInput } from '../states/documents/types';
import type { RealtimeOperationContext } from '../types';

export function updateDocumentOperation(ctx: RealtimeOperationContext) {
  return async function updateDocument(payload: UpdateDocumentInput) {
    const document = await ctx.datastore.emit('updateDocument', payload);
    ctx.datastore.patch({
      documents: ctx.datastore.state.documents.withItem(document.id, document, 'ready'),
    });
    return document;
  };
}
