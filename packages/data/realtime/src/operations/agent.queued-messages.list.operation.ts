import type { ListAgentQueuedMessagesInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function listAgentQueuedMessagesOperation(ctx: RealtimeOperationContext) {
  return async function listAgentQueuedMessages(input: ListAgentQueuedMessagesInput) {
    const result = await ctx.datastore.emit('listAgentQueuedMessages', input);
    ctx.datastore.patch({
      agentQueuedMessages: ctx.datastore.state.agentQueuedMessages.withReadyItems(result.items),
    });
    return result;
  };
}
