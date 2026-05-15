import type { RealtimeOperationContext } from '../types';

export function listTaskTemplateDeliverablesOperation(ctx: RealtimeOperationContext) {
  return async function listTaskTemplateDeliverables(payload: { templateId: string }) {
    const result = await ctx.datastore.emit('listTaskTemplateDeliverables', payload);
    for (const item of result.items) {
      ctx.datastore.patch({
        taskTemplateDeliverables: ctx.datastore.state.taskTemplateDeliverables.withItem(item.id, item, 'ready'),
      });
    }
    return result;
  };
}
