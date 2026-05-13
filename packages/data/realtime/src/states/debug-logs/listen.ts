import type { RealtimeOperationContext } from '../../types';

export function listenToDebugLogs(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('debugLogUpdated', (log) => {
    ctx.datastore.patch({
      debugLogs: ctx.datastore.state.debugLogs.withItem(log.id, log, 'ready'),
    });
  });
}
