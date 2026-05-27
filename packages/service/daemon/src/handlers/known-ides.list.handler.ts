import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListKnownIdesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listKnownIdes'>;
type ListKnownIdesPayload = ListKnownIdesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListKnownIdesPayload) {
    void payload;
    return ctx.datastore.knownIdes.list({});
  };
}
