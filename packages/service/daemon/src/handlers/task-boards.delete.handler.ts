import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteTaskBoardOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteTaskBoard'>;
type Payload = DeleteTaskBoardOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    await ctx.taskBoards.deleteBoard(payload.id);
    ctx.multicastBridge.emit('taskBoardDeleted', { id: payload.id });
    return { id: payload.id };
  };
}
