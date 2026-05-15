import type { RealtimeOperationContext } from '../types';

export function listTaskDeliverableSubmissionsOperation(ctx: RealtimeOperationContext) {
  return async function listTaskDeliverableSubmissions(payload: { taskId: string }) {
    const result = await ctx.datastore.emit('listTaskDeliverableSubmissions', payload);
    for (const item of result.items) {
      ctx.datastore.patch({
        taskDeliverableSubmissions: ctx.datastore.state.taskDeliverableSubmissions.withItem(item.id, item, 'ready'),
      });
    }
    return result;
  };
}
