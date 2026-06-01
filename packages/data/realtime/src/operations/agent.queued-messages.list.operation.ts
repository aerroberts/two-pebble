import type { ListAgentQueuedMessagesInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function listAgentQueuedMessagesOperation(ctx: RealtimeOperationContext) {
  return async function listAgentQueuedMessages(input: ListAgentQueuedMessagesInput) {
    const result = await ctx.datastore.emit('listAgentQueuedMessages', input);
    // This registry is global across agents and also holds optimistic single-row
    // mutations (cancel/send-now). A full-collection replace would wipe other
    // agents' messages and any in-flight optimistic/rolled-back rows. Merge by
    // id instead, mirroring the agent-traces list operation.
    ctx.datastore.patch({
      agentQueuedMessages: ctx.datastore.state.agentQueuedMessages.withMergedReadyItems(result.items),
    });
    return result;
  };
}
