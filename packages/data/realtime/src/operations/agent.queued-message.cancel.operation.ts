import type { CancelAgentQueuedMessageInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function cancelAgentQueuedMessageOperation(ctx: RealtimeOperationContext) {
  return async function cancelAgentQueuedMessage(input: CancelAgentQueuedMessageInput) {
    const existing = ctx.datastore.state.agentQueuedMessages.getItem(input.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        agentQueuedMessages: ctx.datastore.state.agentQueuedMessages.withItem(input.id, existing, 'loading'),
      });
    }

    try {
      const result = await ctx.datastore.emit('cancelAgentQueuedMessage', input);
      if (result.deleted) {
        ctx.datastore.patch({
          agentQueuedMessages: ctx.datastore.state.agentQueuedMessages.withoutItem(input.id),
        });
      }
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
