import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type QueryMetricsAggregatedOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'queryMetricsAggregated'>;
type QueryMetricsAggregatedPayload = QueryMetricsAggregatedOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: QueryMetricsAggregatedPayload) {
    return ctx.datastore.metrics.queryAggregated({
      name: payload.name,
      fromTimestamp: payload.fromTimestamp,
      toTimestamp: payload.toTimestamp,
      bucketSizeMs: payload.bucketSizeMs,
      dimensions: payload.dimensions,
    });
  };
}
