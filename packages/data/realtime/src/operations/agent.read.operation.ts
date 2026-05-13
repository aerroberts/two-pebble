import type { ReadAgentInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function readAgentOperation(ctx: RealtimeOperationContext) {
  return async function readAgent(input: ReadAgentInput) {
    const agent = await ctx.datastore.emit('readAgent', input);
    ctx.datastore.patch({ agents: ctx.datastore.state.agents.withItem(agent.id, agent, 'ready') });
    return agent;
  };
}
