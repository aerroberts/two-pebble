import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListDocumentsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listDocuments'>;
type ListDocumentsPayload = ListDocumentsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListDocumentsPayload) {
    return ctx.datastore.documents.list({
      limit: payload.limit ?? 200,
      offset: payload.offset ?? 0,
      projectId: payload.projectId,
    });
  };
}
