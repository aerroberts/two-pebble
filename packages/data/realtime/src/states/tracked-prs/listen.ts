import type { RealtimeOperationContext } from '../../types';

export function listenToTrackedPrs(ctx: RealtimeOperationContext): void {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('trackedPrRecorded', (record) => {
    ctx.datastore.patch({
      trackedPrs: ctx.datastore.state.trackedPrs.withItem(record.id, record, 'ready'),
    });
  });
}
