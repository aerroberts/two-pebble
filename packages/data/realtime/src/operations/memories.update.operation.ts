import type { UpdateMemoryInput } from '../states/memories/types';
import type { RealtimeOperationContext } from '../types';

export function updateMemoryOperation(ctx: RealtimeOperationContext) {
  return async function updateMemory(payload: UpdateMemoryInput) {
    const memory = await ctx.datastore.emit('updateMemory', payload);
    ctx.datastore.patch({
      memories: ctx.datastore.state.memories.withItem(memory.id, memory, 'ready'),
    });
    return memory;
  };
}
