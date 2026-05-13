import type { RealtimeOperationContext } from '../types';

export function updateIntegrationOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('updateIntegration');
}
