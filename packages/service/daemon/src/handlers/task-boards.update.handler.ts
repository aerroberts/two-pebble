import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateTaskBoardOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateTaskBoard'>;
type Payload = UpdateTaskBoardOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.taskBoards.updateBoard(payload.id, payload.name);
    ctx.multicastBridge.emit('taskBoardUpdated', record);
    return { id: record.id };
  };
}
