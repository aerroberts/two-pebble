import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function updateTaskTemplateDeliverableOperation(ctx: RealtimeOperationContext) {
  return async function updateTaskTemplateDeliverable(payload: RealtimeEmitPayload<'updateTaskTemplateDeliverable'>) {
    return ctx.datastore.emit('updateTaskTemplateDeliverable', payload);
  };
}
