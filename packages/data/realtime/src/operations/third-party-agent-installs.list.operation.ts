import type { RealtimeOperationContext } from '../types';

export function listThirdPartyAgentInstallsOperation(ctx: RealtimeOperationContext) {
  return async function listThirdPartyAgentInstalls() {
    if (ctx.datastore.state.thirdPartyAgentInstalls.status === 'loading') {
      return;
    }

    ctx.datastore.patch({
      thirdPartyAgentInstalls: ctx.datastore.state.thirdPartyAgentInstalls.withStatus('loading'),
    });
    try {
      const result = await ctx.datastore.emit('listThirdPartyAgentInstalls', { limit: 50, offset: 0 });
      ctx.datastore.patch({
        thirdPartyAgentInstalls: ctx.datastore.state.thirdPartyAgentInstalls.withReadyItems(result.items),
      });
    } catch (error) {
      ctx.datastore.patch({ thirdPartyAgentInstalls: ctx.datastore.state.thirdPartyAgentInstalls.withStatus('error') });
      throw error;
    }
  };
}
