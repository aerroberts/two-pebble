import type { SendAgentMessageInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function sendAgentMessageOperation(ctx: RealtimeOperationContext) {
  return async function sendAgentMessage(input: SendAgentMessageInput) {
    return ctx.datastore.emit('sendAgentMessage', input);
  };
}
