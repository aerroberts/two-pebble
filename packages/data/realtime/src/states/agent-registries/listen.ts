import type { RealtimeOperationContext } from '../../types';

export function listenToAgentRegistries(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('agentRegistryDeleted', (deleted) => {
    ctx.datastore.patch({ agentRegistries: ctx.datastore.state.agentRegistries.withoutItem(deleted.id) });
  });
  client.listen('agentRegistryUpdated', (registry) => {
    ctx.datastore.patch({
      agentRegistries: ctx.datastore.state.agentRegistries.withItem(registry.id, registry, 'ready'),
    });
  });
}
