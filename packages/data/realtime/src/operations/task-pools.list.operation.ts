import type { RealtimeOperationContext } from '../types';

export interface ListInput {
  boardId: string;
}

export function listTaskPoolsOperation(ctx: RealtimeOperationContext) {
  return async function listTaskPools(input: ListInput) {
    const result = await ctx.datastore.emit('listTaskPools', input);
    ctx.datastore.patch({ taskPools: ctx.datastore.state.taskPools.withReadyItems(result.items) });
  };
}
