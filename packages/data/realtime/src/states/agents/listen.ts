import type { RealtimeOperationContext } from '../../types';

export function listenToAgents(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('agentRecorded', (agent) => {
    ctx.datastore.patch({
      agents: ctx.datastore.state.agents.withItem(agent.id, agent, 'ready'),
    });
  });
}
