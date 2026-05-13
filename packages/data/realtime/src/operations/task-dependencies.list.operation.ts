import type { RealtimeOperationContext } from '../types';

export interface ListInput {
  boardId: string;
}

export function listTaskDependenciesOperation(ctx: RealtimeOperationContext) {
  return async function listTaskDependencies(input: ListInput) {
    const result = await ctx.datastore.emit('listTaskDependencies', input);
    ctx.datastore.patch({
      taskDependencies: ctx.datastore.state.taskDependencies.withReadyItems(result.items),
    });
  };
}
