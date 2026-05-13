import type { RealtimeOperationContext } from '../../types';

export function listenToIntegrations(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('integrationDeleted', (deleted) => {
    ctx.datastore.patch({ integrations: ctx.datastore.state.integrations.withoutItem(deleted.id) });
  });
  client.listen('integrationUpdated', (integration) => {
    ctx.datastore.patch({
      integrations: ctx.datastore.state.integrations.withItem(integration.id, integration, 'ready'),
    });
  });
}
