import type { DebugLogInput } from '../states/debug-logs/types';
import type { RealtimeOperationContext } from '../types';

export function openDebugLogOperation(ctx: RealtimeOperationContext) {
  return async function openDebugLog(input: DebugLogInput) {
    await ctx.datastore.emit('openDebugLog', input);
  };
}
