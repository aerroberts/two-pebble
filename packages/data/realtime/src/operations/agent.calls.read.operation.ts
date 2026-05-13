import type { ReadAgentCallInput } from '../states/agent-calls/types';
import type { RealtimeOperationContext } from '../types';

export function readAgentCallOperation(ctx: RealtimeOperationContext) {
  return async function readAgentCall(input: ReadAgentCallInput) {
    const call = await ctx.datastore.emit('readAgentCall', input);
    ctx.datastore.patch({ agentCalls: ctx.datastore.state.agentCalls.withItem(call.id, call, 'ready') });
    return call;
  };
}
