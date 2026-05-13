import type { ListAgentCallsInput } from '../states/agent-calls/types';
import type { RealtimeOperationContext } from '../types';

export function listAgentCallsOperation(ctx: RealtimeOperationContext) {
  return async function listAgentCalls(input: ListAgentCallsInput) {
    if (ctx.datastore.state.agentCalls.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ agentCalls: ctx.datastore.state.agentCalls.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listAgentCalls', {
        agentId: input.agentId,
        limit: 50,
        offset: 0,
      });
      ctx.datastore.patch({ agentCalls: ctx.datastore.state.agentCalls.withReadyItems(result.items) });
      return result;
    } catch (error) {
      ctx.datastore.patch({ agentCalls: ctx.datastore.state.agentCalls.withStatus('error') });
      throw error;
    }
  };
}
