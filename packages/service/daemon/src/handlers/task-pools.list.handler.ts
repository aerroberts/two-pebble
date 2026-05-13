import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListPoolsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listTaskPools'>;
type Payload = ListPoolsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    return ctx.datastore.taskBoards.pools.list({ boardId: payload.boardId });
  };
}
