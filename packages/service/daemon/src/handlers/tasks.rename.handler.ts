import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type RenameTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'renameTask'>;
type Payload = RenameTaskOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.taskBoards.renameTask(payload.id, payload.name);
    const refreshed = await ctx.taskBoards.listTasks(record.boardId);
    for (const task of refreshed) {
      ctx.multicastBridge.emit('taskUpdated', task);
    }
    return { id: record.id };
  };
}
