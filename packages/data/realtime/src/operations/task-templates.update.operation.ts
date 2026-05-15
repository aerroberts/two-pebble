import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function updateTaskTemplateOperation(ctx: RealtimeOperationContext) {
  return async function updateTaskTemplate(payload: RealtimeEmitPayload<'updateTaskTemplate'>) {
    return ctx.datastore.emit('updateTaskTemplate', payload);
  };
}
