import type { RealtimeOperationContext } from '../types';

export interface ListInput {
  boardId: string;
}

export function listTasksOperation(ctx: RealtimeOperationContext) {
  return async function listTasks(input: ListInput) {
    const result = await ctx.datastore.emit('listTasks', input);
    ctx.datastore.patch({ tasks: ctx.datastore.state.tasks.withReadyItems(result.items) });
  };
}
