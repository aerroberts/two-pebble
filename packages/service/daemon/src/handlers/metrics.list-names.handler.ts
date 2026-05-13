import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListMetricNamesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listMetricNames'>;
type ListMetricNamesPayload = ListMetricNamesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: ListMetricNamesPayload) {
    return ctx.datastore.metrics.listNames({});
  };
}
