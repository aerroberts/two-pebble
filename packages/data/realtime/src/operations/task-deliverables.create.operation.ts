import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function createTaskDeliverableOperation(ctx: RealtimeOperationContext) {
  return async function createTaskDeliverable(payload: RealtimeEmitPayload<'createTaskDeliverable'>) {
    return ctx.datastore.emit('createTaskDeliverable', payload);
  };
}
