import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function createTaskTemplateOperation(ctx: RealtimeOperationContext) {
  return async function createTaskTemplate(payload: RealtimeEmitPayload<'createTaskTemplate'>) {
    return ctx.datastore.emit('createTaskTemplate', payload);
  };
}
