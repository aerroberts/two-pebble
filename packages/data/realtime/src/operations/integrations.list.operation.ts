import type { RealtimeOperationContext } from '../types';

export function listIntegrationsOperation(ctx: RealtimeOperationContext) {
  return async function listIntegrations() {
    if (ctx.datastore.state.integrations.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ integrations: ctx.datastore.state.integrations.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listIntegrations', { limit: 50, offset: 0 });
      ctx.datastore.patch({ integrations: ctx.datastore.state.integrations.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ integrations: ctx.datastore.state.integrations.withStatus('error') });
      throw error;
    }
  };
}
