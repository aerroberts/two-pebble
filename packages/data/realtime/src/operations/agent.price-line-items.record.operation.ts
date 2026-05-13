import type { RecordAgentPriceLineItemInput } from '../states/agent-price-line-items/types';
import type { RealtimeOperationContext } from '../types';

export function recordAgentPriceLineItemOperation(ctx: RealtimeOperationContext) {
  return async function recordAgentPriceLineItem(input: RecordAgentPriceLineItemInput) {
    return ctx.datastore.emit('recordAgentPriceLineItem', input);
  };
}
