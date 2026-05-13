import type { RealtimeOperationContext } from '../types';

export interface ListInput {
  taskId: string;
}

export function listTaskEventsOperation(ctx: RealtimeOperationContext) {
  return async function listTaskEvents(input: ListInput) {
    const result = await ctx.datastore.emit('listTaskEvents', input);
    let next = ctx.datastore.state.taskEvents;
    for (const event of result.items) next = next.withItem(event.id, event, 'ready');
    ctx.datastore.patch({ taskEvents: next });
    return result;
  };
}
