import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ReadMemoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readMemory'>;
type ReadMemoryPayload = ReadMemoryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ReadMemoryPayload) {
    return ctx.datastore.memories.read(payload);
  };
}
