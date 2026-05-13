import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ReadThreadSnapshotOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readThreadSnapshot'>;
type ReadThreadSnapshotPayload = ReadThreadSnapshotOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ReadThreadSnapshotPayload) {
    return ctx.datastore.agent.conversationCells.snapshot({
      orderId: payload.orderId,
      threadId: payload.threadId,
    });
  };
}
