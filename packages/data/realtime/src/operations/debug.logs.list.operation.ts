import type { RealtimeOperationContext } from '../types';

export function listDebugLogsOperation(ctx: RealtimeOperationContext) {
  return async function listDebugLogs() {
    if (ctx.datastore.state.debugLogs.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ debugLogs: ctx.datastore.state.debugLogs.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listDebugLogs', { limit: 50, offset: 0 });
      ctx.datastore.patch({ debugLogs: ctx.datastore.state.debugLogs.withReadyItems(result.items) });
      return result;
    } catch (error) {
      ctx.datastore.patch({ debugLogs: ctx.datastore.state.debugLogs.withStatus('error') });
      throw error;
    }
  };
}
