import type { RealtimeEmitResponse, RealtimeOperationContext } from '../types';

export function listTaskDispatchSettingsOperation(ctx: RealtimeOperationContext) {
  return async function listTaskDispatchSettings(): Promise<RealtimeEmitResponse<'listTaskDispatchSettings'>> {
    return ctx.datastore.emit('listTaskDispatchSettings', {});
  };
}
