import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function createTaskTemplateDeliverableOperation(ctx: RealtimeOperationContext) {
  return async function createTaskTemplateDeliverable(payload: RealtimeEmitPayload<'createTaskTemplateDeliverable'>) {
    return ctx.datastore.emit('createTaskTemplateDeliverable', payload);
  };
}
