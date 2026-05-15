import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function deleteTaskTemplateOperation(ctx: RealtimeOperationContext) {
  return async function deleteTaskTemplate(payload: RealtimeEmitPayload<'deleteTaskTemplate'>) {
    return ctx.datastore.emit('deleteTaskTemplate', payload);
  };
}
