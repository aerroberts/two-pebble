import type { RealtimeEmitPayload, RealtimeEmitResponse, RealtimeOperationContext } from '../types';

export function readTaskDispatchSettingsOperation(ctx: RealtimeOperationContext) {
  return async function readTaskDispatchSettings(
    payload: RealtimeEmitPayload<'readTaskDispatchSettings'>,
  ): Promise<RealtimeEmitResponse<'readTaskDispatchSettings'>> {
    return ctx.datastore.emit('readTaskDispatchSettings', payload);
  };
}
