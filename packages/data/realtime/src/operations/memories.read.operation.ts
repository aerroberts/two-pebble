import type { ReadMemoryInput } from '../states/memories/types';
import type { RealtimeOperationContext } from '../types';

export function readMemoryOperation(ctx: RealtimeOperationContext) {
  return async function readMemory(payload: ReadMemoryInput) {
    const existing = ctx.datastore.state.memories.getItem(payload.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        memories: ctx.datastore.state.memories.withItem(payload.id, existing, 'loading'),
      });
    }

    try {
      const memory = await ctx.datastore.emit('readMemory', payload);
      ctx.datastore.patch({
        memories: ctx.datastore.state.memories.withItem(memory.id, memory, 'ready'),
      });
      return memory;
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
