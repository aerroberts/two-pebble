import type { RealtimeOperationContext } from '../../types';

export function listenToMemories(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('memoryDeleted', (deleted) => {
    ctx.datastore.patch({ memories: ctx.datastore.state.memories.withoutItem(deleted.id) });
  });
  client.listen('memoryUpdated', (memory) => {
    ctx.datastore.patch({
      memories: ctx.datastore.state.memories.withItem(memory.id, memory, 'ready'),
    });
  });
}
