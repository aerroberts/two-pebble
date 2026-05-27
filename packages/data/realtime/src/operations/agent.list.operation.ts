import type { RealtimeOperationContext } from '../types';

export function listAgentsOperation(ctx: RealtimeOperationContext) {
  return async function listAgents(input: { projectId?: string } = {}) {
    if (ctx.datastore.state.agents.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ agents: ctx.datastore.state.agents.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listAgents', { limit: 50, offset: 0, projectId: input.projectId });
      ctx.datastore.patch({ agents: ctx.datastore.state.agents.withReadyItems(result.items) });
      return result;
    } catch (error) {
      ctx.datastore.patch({ agents: ctx.datastore.state.agents.withStatus('error') });
      throw error;
    }
  };
}
