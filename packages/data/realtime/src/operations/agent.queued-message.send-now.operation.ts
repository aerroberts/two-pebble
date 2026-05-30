import type { SendAgentQueuedMessageNowInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function sendAgentQueuedMessageNowOperation(ctx: RealtimeOperationContext) {
  return async function sendAgentQueuedMessageNow(input: SendAgentQueuedMessageNowInput) {
    const existing = ctx.datastore.state.agentQueuedMessages.getItem(input.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        agentQueuedMessages: ctx.datastore.state.agentQueuedMessages.withItem(input.id, existing, 'loading'),
      });
    }

    try {
      const result = await ctx.datastore.emit('sendAgentQueuedMessageNow', input);
      ctx.datastore.patch({
        agentQueuedMessages: ctx.datastore.state.agentQueuedMessages.withItem(result.id, result, 'ready'),
      });
      return result;
    } catch (error) {
      if (existing !== undefined && existing !== null) {
        ctx.datastore.patch({
          agentQueuedMessages: ctx.datastore.state.agentQueuedMessages.withItem(input.id, existing, 'ready'),
        });
      }
      throw error;
    }
  };
}
