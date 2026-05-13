import type { RealtimeOperationContext } from '../types';

export function migrateDatabaseOperation(ctx: RealtimeOperationContext) {
  return async function migrateDatabase() {
    return ctx.datastore.emit('migrateDatabase', {});
  };
}
