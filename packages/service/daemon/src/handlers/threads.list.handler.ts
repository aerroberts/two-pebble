import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListThreadsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listThreads'>;
type ListThreadsPayload = ListThreadsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: ListThreadsPayload) {
    return ctx.datastore.threads.list();
  };
}
