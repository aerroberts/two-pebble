import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DescribeDatabaseOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'describeDatabase'>;
type DescribeDatabasePayload = DescribeDatabaseOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: DescribeDatabasePayload) {
    return ctx.datastore.describeDatabase();
  };
}
