import type { RealtimeOperationContext } from '../types';

export function listAutomationsOperation(ctx: RealtimeOperationContext) {
  return async function listAutomations() {
    if (ctx.datastore.state.automations.status === 'loading') {
      return;
    }
    ctx.datastore.patch({ automations: ctx.datastore.state.automations.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listAutomations', { limit: 100, offset: 0 });
      ctx.datastore.patch({ automations: ctx.datastore.state.automations.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ automations: ctx.datastore.state.automations.withStatus('error') });
      throw error;
    }
  };
}
