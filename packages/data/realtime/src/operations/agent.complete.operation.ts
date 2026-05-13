import type { CompleteAgentInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function completeAgentOperation(ctx: RealtimeOperationContext) {
  return async function completeAgent(input: CompleteAgentInput) {
    return ctx.datastore.emit('completeAgent', input);
  };
}
