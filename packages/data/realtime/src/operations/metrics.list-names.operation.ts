import type { RealtimeOperationContext } from '../types';

export function listMetricNamesOperation(ctx: RealtimeOperationContext) {
  return async function listMetricNames() {
    return ctx.datastore.emit('listMetricNames', {});
  };
}
