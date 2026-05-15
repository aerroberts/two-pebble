import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ReadDocumentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readDocument'>;
type ReadDocumentPayload = ReadDocumentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ReadDocumentPayload) {
    return ctx.datastore.documents.read(payload);
  };
}
