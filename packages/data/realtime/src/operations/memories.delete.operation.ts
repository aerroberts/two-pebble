import type { DeleteMemoryInput } from '../states/memories/types';
import type { RealtimeOperationContext } from '../types';

export function deleteMemoryOperation(ctx: RealtimeOperationContext) {
  return async function deleteMemory(payload: DeleteMemoryInput) {
    const existing = ctx.datastore.state.memories.getItem(payload.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        memories: ctx.datastore.state.memories.withItem(payload.id, existing, 'loading'),
      });
    }

    try {
      const deleted = await ctx.datastore.emit('deleteMemory', payload);
      ctx.datastore.patch({ memories: ctx.datastore.state.memories.withoutItem(payload.id) });
      return deleted;
    } catch (error) {
      if (existing !== undefined && existing !== null) {
        ctx.datastore.patch({
          memories: ctx.datastore.state.memories.withItem(payload.id, existing, 'ready'),
        });
      }
      throw error;
    }
  };
}
