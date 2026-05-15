import type { RealtimeOperationContext } from '../types';

export function listTaskTemplatesOperation(ctx: RealtimeOperationContext) {
  return async function listTaskTemplates(payload: { boardId: string }) {
    const result = await ctx.datastore.emit('listTaskTemplates', payload);
    for (const item of result.items) {
      ctx.datastore.patch({ taskTemplates: ctx.datastore.state.taskTemplates.withItem(item.id, item, 'ready') });
    }
    return result;
  };
}
