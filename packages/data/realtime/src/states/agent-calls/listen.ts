import type { RealtimeOperationContext } from '../../types';

export function listenToAgentCalls(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('agentCallRecorded', (call) => {
    ctx.datastore.patch({
      agentCalls: ctx.datastore.state.agentCalls.withItem(call.id, call, 'ready'),
    });
  });
}
