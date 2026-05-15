import type { RealtimeOperationContext } from '../types';

export function listTaskDeliverablesOperation(ctx: RealtimeOperationContext) {
  return async function listTaskDeliverables(payload: { taskId: string }) {
    const result = await ctx.datastore.emit('listTaskDeliverables', payload);
    for (const item of result.items) {
      ctx.datastore.patch({ taskDeliverables: ctx.datastore.state.taskDeliverables.withItem(item.id, item, 'ready') });
    }
    return result;
  };
}
