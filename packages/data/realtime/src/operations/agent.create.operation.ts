import type { CreateAgentInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function createAgentOperation(ctx: RealtimeOperationContext) {
  return async function createAgent(input: CreateAgentInput) {
    return ctx.datastore.emit('createAgent', input);
  };
}
