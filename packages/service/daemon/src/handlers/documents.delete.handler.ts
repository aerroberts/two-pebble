import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteDocumentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteDocument'>;
type DeleteDocumentPayload = DeleteDocumentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteDocumentPayload) {
    const deleted = await ctx.datastore.documents.delete(payload);

    ctx.events.emit('documentDeleted', deleted);

    return deleted;
  };
}
