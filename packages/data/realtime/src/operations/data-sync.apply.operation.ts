import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function applyDataSyncPlanOperation(ctx: RealtimeOperationContext) {
  return async function applyDataSyncPlan(input: RealtimeEmitPayload<'applyDataSyncPlan'>) {
    return ctx.datastore.emit('applyDataSyncPlan', input);
  };
}
