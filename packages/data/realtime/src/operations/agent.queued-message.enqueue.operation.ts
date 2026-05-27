import type { EnqueueAgentMessageInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function enqueueAgentMessageOperation(ctx: RealtimeOperationContext) {
  return async function enqueueAgentMessage(input: EnqueueAgentMessageInput) {
    return ctx.datastore.emit('enqueueAgentMessage', input);
  };
}
