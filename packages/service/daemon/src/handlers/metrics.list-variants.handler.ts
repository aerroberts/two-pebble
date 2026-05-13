import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListMetricVariantsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listMetricVariants'>;
type ListMetricVariantsPayload = ListMetricVariantsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListMetricVariantsPayload) {
    return ctx.datastore.metrics.listVariants({ name: payload.name });
  };
}
