import type { RealtimeOperationContext } from '../types';

export interface FreshStartAgentInput {
  agentId: string;
}

export function freshStartAgentOperation(ctx: RealtimeOperationContext) {
  return async function freshStartAgent(input: FreshStartAgentInput) {
    return ctx.datastore.emit('freshStartAgent', input);
  };
}
