import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function deleteTaskDeliverableOperation(ctx: RealtimeOperationContext) {
  return async function deleteTaskDeliverable(payload: RealtimeEmitPayload<'deleteTaskDeliverable'>) {
    return ctx.datastore.emit('deleteTaskDeliverable', payload);
  };
}
