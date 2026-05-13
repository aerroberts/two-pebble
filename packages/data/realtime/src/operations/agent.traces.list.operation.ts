import type { ListAgentTracesInput } from '../states/agent-traces/types';
import type { RealtimeEmitResponse, RealtimeOperationContext } from '../types';

const PAGE_SIZE = 500;

export function listAgentTracesOperation(ctx: RealtimeOperationContext) {
  return async function listAgentTraces(input: ListAgentTracesInput) {
    if (ctx.datastore.state.agentTraces.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ agentTraces: ctx.datastore.state.agentTraces.withStatus('loading') });
    try {
      let next = ctx.datastore.state.agentTraces;
      let offset = 0;
      let lastResult: RealtimeEmitResponse<'listAgentTraces'> | undefined;
      while (true) {
        const result = await ctx.datastore.emit('listAgentTraces', {
          agentId: input.agentId,
          limit: PAGE_SIZE,
          offset,
        });
        next = result.items.reduce((registry, item) => registry.withItem(item.id, item, 'ready'), next);
        lastResult = result;
        offset += result.items.length;
        if (result.items.length < PAGE_SIZE || offset >= result.page.total) break;
      }
      ctx.datastore.patch({ agentTraces: next.withStatus('ready') });
      return lastResult;
    } catch (error) {
      ctx.datastore.patch({ agentTraces: ctx.datastore.state.agentTraces.withStatus('error') });
      throw error;
    }
  };
}
