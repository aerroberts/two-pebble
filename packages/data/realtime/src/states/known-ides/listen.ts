import type { RealtimeOperationContext } from '../../types';

export function listenToKnownIdes(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('knownIdeDeleted', (deleted) => {
    ctx.datastore.patch({ knownIdes: ctx.datastore.state.knownIdes.withoutItem(deleted.id) });
  });
  client.listen('knownIdeUpdated', (knownIde) => {
    ctx.datastore.patch({
      knownIdes: ctx.datastore.state.knownIdes.withItem(knownIde.id, knownIde, 'ready'),
    });
  });
}
