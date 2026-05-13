import type { FailAgentInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function failAgentOperation(ctx: RealtimeOperationContext) {
  return async function failAgent(input: FailAgentInput) {
    return ctx.datastore.emit('failAgent', input);
  };
}
