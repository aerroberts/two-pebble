import type { RealtimeOperationContext } from '../../types';
import { agentPriceLineItemKey } from './state';

export function listenToAgentPriceLineItems(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('agentPriceLineItemRecorded', (lineItem) => {
    ctx.datastore.patch({
      agentPriceLineItemAgents: ctx.datastore.state.agentPriceLineItemAgents.withItem(
        lineItem.agentId,
        { id: lineItem.agentId },
        'ready',
      ),
      agentPriceLineItems: ctx.datastore.state.agentPriceLineItems.withItem(
        agentPriceLineItemKey(lineItem),
        lineItem,
        'ready',
      ),
    });
  });
}
