import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateDocumentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateDocument'>;
type UpdateDocumentPayload = UpdateDocumentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: UpdateDocumentPayload) {
    const document = await ctx.datastore.documents.update(payload);

    ctx.multicastBridge.emit('documentUpdated', document);

    return document;
  };
}
