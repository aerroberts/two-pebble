import type { RealtimeEmitPayload, RealtimeOperationContext } from '../types';

export function buildDataSyncPlanOperation(ctx: RealtimeOperationContext) {
  return async function buildDataSyncPlan(input: RealtimeEmitPayload<'buildDataSyncPlan'>) {
    return ctx.datastore.emit('buildDataSyncPlan', input);
  };
}
