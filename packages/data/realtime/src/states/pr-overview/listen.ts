import { listPrOverviewOperation } from '../../operations/pr-overview.list.operation';
import type { RealtimeOperationContext } from '../../types';

/**
 * Keeps the overview read-model live. The aggregate is derived server-side, so
 * rather than mutating it from individual records we simply re-fetch it whenever
 * a task or tracked-PR push event lands — but only once it has been loaded, so
 * this stays inert until the overview page mounts. The operation's in-flight
 * dedupe collapses bursts of events into a single refetch.
 */
export function listenToPrOverview(ctx: RealtimeOperationContext): void {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }
  const refetch = listPrOverviewOperation(ctx);
  const refresh = () => {
    if (ctx.datastore.state.prOverview.status === 'idle') {
      return;
    }
    void refetch({}).catch(() => undefined);
  };
  client.listen('taskUpdated', refresh);
  client.listen('taskDeleted', refresh);
  client.listen('trackedPrRecorded', refresh);
  client.listen('taskDeliverableSubmissionRecorded', refresh);
}
