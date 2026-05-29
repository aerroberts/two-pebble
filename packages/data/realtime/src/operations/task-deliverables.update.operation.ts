import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function updateTaskDeliverableOperation(ctx: RealtimeOperationContext) {
  return async function updateTaskDeliverable(payload: RealtimeEmitPayload<'updateTaskDeliverable'>) {
    return ctx.datastore.emit('updateTaskDeliverable', payload);
  };
}
