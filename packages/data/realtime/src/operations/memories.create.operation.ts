import type { CreateMemoryInput, CreateMemoryResponse } from '../states/memories/types';
import type { RealtimeOperationContext } from '../types';

export function createMemoryOperation(ctx: RealtimeOperationContext) {
  return async function createMemory(payload: CreateMemoryInput): Promise<CreateMemoryResponse> {
    const memory = await ctx.datastore.emit('createMemory', payload);
    ctx.datastore.patch({
      memories: ctx.datastore.state.memories.withItem(memory.id, memory, 'ready'),
    });
    return memory;
  };
}
