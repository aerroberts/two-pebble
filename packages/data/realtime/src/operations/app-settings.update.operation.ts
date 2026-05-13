import type { RealtimeOperationContext } from '../types';

export function updateAppSettingsOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('updateAppSettings');
}
