import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateTaskDescriptionOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateTaskDescription'>;
type Payload = UpdateTaskDescriptionOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.taskBoards.updateTaskDescription(payload.id, payload.description);
    const refreshed = await ctx.taskBoards.listTasks(record.boardId);
    for (const task of refreshed) {
      ctx.multicastBridge.emit('taskUpdated', task);
    }
    return { id: record.id };
  };
}
