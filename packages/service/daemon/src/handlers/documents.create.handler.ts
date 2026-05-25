import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateDocumentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createDocument'>;
type CreateDocumentPayload = CreateDocumentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateDocumentPayload) {
    const document = await ctx.datastore.documents.create(payload);

    ctx.events.emit('documentUpdated', document);

    return document;
  };
}
