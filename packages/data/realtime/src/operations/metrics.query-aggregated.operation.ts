import type { RealtimeOperationContext } from '../types';

export interface QueryMetricsAggregatedInput {
  name: string;
  fromTimestamp: number;
  toTimestamp: number;
  bucketSizeMs: number;
  dimensions?: Record<string, string>;
}

export function queryMetricsAggregatedOperation(ctx: RealtimeOperationContext) {
  return async function queryMetricsAggregated(input: QueryMetricsAggregatedInput) {
    return ctx.datastore.emit('queryMetricsAggregated', input);
  };
}
