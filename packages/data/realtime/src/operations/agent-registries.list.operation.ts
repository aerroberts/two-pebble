import type { RealtimeOperationContext } from '../types';

export function listAgentRegistriesOperation(ctx: RealtimeOperationContext) {
  return async function listAgentRegistries() {
    if (ctx.datastore.state.agentRegistries.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ agentRegistries: ctx.datastore.state.agentRegistries.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listAgentRegistries', { limit: 50, offset: 0 });
      ctx.datastore.patch({ agentRegistries: ctx.datastore.state.agentRegistries.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ agentRegistries: ctx.datastore.state.agentRegistries.withStatus('error') });
      throw error;
    }
  };
}
