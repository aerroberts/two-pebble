import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateTaskBoardOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createTaskBoard'>;
type Payload = CreateTaskBoardOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.taskBoards.createBoard({ name: payload.name });
    ctx.events.emit('taskBoardUpdated', record);
    return { id: record.id };
  };
}
