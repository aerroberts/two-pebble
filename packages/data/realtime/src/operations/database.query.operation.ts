import type { RealtimeOperationContext } from '../types';

export function runDatabaseQueryOperation(ctx: RealtimeOperationContext) {
  return async function runDatabaseQuery(query: string) {
    return ctx.datastore.emit('runDatabaseQuery', { query });
  };
}
