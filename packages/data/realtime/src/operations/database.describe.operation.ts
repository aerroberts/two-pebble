import type { RealtimeOperationContext } from '../types';

export function describeDatabaseOperation(ctx: RealtimeOperationContext) {
  return async function describeDatabase() {
    return ctx.datastore.emit('describeDatabase', {});
  };
}
