import type { RealtimeOperationContext } from '../../types';

export function listenToDocuments(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('documentDeleted', (deleted) => {
    ctx.datastore.patch({ documents: ctx.datastore.state.documents.withoutItem(deleted.id) });
  });
  client.listen('documentUpdated', (document) => {
    ctx.datastore.patch({
      documents: ctx.datastore.state.documents.withItem(document.id, document, 'ready'),
    });
  });
}
