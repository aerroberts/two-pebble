import type { RealtimeOperationContext } from '../types';

export function openDebugLogsDirectoryOperation(ctx: RealtimeOperationContext) {
  return async function openDebugLogsDirectory() {
    await ctx.datastore.emit('openDebugLogsDirectory', {});
  };
}
