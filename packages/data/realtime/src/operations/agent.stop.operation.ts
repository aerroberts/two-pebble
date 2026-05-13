import type { RealtimeOperationContext } from '../types';

export interface StopAgentInput {
  agentId: string;
  reason?: string;
}

export function stopAgentOperation(ctx: RealtimeOperationContext) {
  return async function stopAgent(input: StopAgentInput) {
    return ctx.datastore.emit('stopAgent', input);
  };
}
