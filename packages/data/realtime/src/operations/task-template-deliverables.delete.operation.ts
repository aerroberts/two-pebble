import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function deleteTaskTemplateDeliverableOperation(ctx: RealtimeOperationContext) {
  return async function deleteTaskTemplateDeliverable(payload: RealtimeEmitPayload<'deleteTaskTemplateDeliverable'>) {
    return ctx.datastore.emit('deleteTaskTemplateDeliverable', payload);
  };
}
