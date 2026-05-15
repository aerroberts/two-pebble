import type { CreateDocumentInput, CreateDocumentResponse } from '../states/documents/types';
import type { RealtimeOperationContext } from '../types';

export function createDocumentOperation(ctx: RealtimeOperationContext) {
  return async function createDocument(payload: CreateDocumentInput): Promise<CreateDocumentResponse> {
    const document = await ctx.datastore.emit('createDocument', payload);
    ctx.datastore.patch({
      documents: ctx.datastore.state.documents.withItem(document.id, document, 'ready'),
    });
    return document;
  };
}
