import { agentPriceLineItemKey } from '../states/agent-price-line-items/state';
import type { ListAgentPriceLineItemsInput } from '../states/agent-price-line-items/types';
import type { RealtimeOperationContext } from '../types';

export function listAgentPriceLineItemsOperation(ctx: RealtimeOperationContext) {
  return async function listAgentPriceLineItems(input: ListAgentPriceLineItemsInput) {
    ctx.datastore.patch({
      agentPriceLineItemAgents: ctx.datastore.state.agentPriceLineItemAgents.withItem(
        input.agentId,
        { id: input.agentId },
        'loading',
      ),
    });

    try {
      const result = await ctx.datastore.emit('listAgentPriceLineItems', input);
      let nextLineItems = ctx.datastore.state.agentPriceLineItems;
      for (const lineItem of result.items) {
        nextLineItems = nextLineItems.withItem(agentPriceLineItemKey(lineItem), lineItem, 'ready');
      }
      ctx.datastore.patch({
        agentPriceLineItemAgents: ctx.datastore.state.agentPriceLineItemAgents.withItem(
          input.agentId,
          { id: input.agentId },
          'ready',
        ),
        agentPriceLineItems: nextLineItems,
      });
      return result;
    } catch (error) {
      ctx.datastore.patch({
        agentPriceLineItemAgents: ctx.datastore.state.agentPriceLineItemAgents.withItem(
          input.agentId,
          { id: input.agentId },
          'error',
        ),
      });
      throw error;
    }
  };
}
