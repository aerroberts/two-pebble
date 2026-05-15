import type { RealtimeEmitPayload, RealtimeEmitResponse, RealtimeOperationContext } from '../types';

export function updateTaskDispatchSettingsOperation(ctx: RealtimeOperationContext) {
  return async function updateTaskDispatchSettings(
    payload: RealtimeEmitPayload<'updateTaskDispatchSettings'>,
  ): Promise<RealtimeEmitResponse<'updateTaskDispatchSettings'>> {
    return ctx.datastore.emit('updateTaskDispatchSettings', payload);
  };
}
