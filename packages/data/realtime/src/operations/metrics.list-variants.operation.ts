import type { RealtimeOperationContext } from '../types';

export interface ListMetricVariantsInput {
  name: string;
}

export function listMetricVariantsOperation(ctx: RealtimeOperationContext) {
  return async function listMetricVariants(input: ListMetricVariantsInput) {
    return ctx.datastore.emit('listMetricVariants', input);
  };
}
