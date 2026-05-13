import type { RealtimeOperationContext } from '../types';

export function openDatabaseOperation(ctx: RealtimeOperationContext) {
  return async function openDatabase() {
    return ctx.datastore.emit('openDatabase', {});
  };
}
