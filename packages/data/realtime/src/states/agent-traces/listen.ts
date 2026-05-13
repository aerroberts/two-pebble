import type { RealtimeOperationContext } from '../../types';

export function listenToAgentTraces(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('agentTraceRecorded', (trace) => {
    ctx.datastore.patch({
      agentTraces: ctx.datastore.state.agentTraces.withItem(trace.id, trace, 'ready'),
    });
  });
}
