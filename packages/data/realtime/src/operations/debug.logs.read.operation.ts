import type { DebugLogInput } from '../states/debug-logs/types';
import type { RealtimeOperationContext } from '../types';

export function readDebugLogOperation(ctx: RealtimeOperationContext) {
  return async function readDebugLog(input: DebugLogInput) {
    const result = await ctx.datastore.emit('readDebugLog', input);
    const record = {
      id: result.id,
      name: result.name,
      path: result.path,
      sizeBytes: result.sizeBytes,
      updatedAtIso: result.updatedAtIso,
    };
    ctx.datastore.patch({ debugLogs: ctx.datastore.state.debugLogs.withItem(record.id, record, 'ready') });
    return result;
  };
}
