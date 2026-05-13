import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type SetTaskStatusOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'setTaskStatus'>;
type Payload = SetTaskStatusOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const tasks = await ctx.datastore.taskBoards.list({});
    let boardId: string | undefined;
    for (const board of tasks.items) {
      const items = await ctx.datastore.taskBoards.tasks.list({ boardId: board.id });
      if (items.items.some((task) => task.id === payload.id)) {
        boardId = board.id;
        break;
      }
    }
    if (boardId === undefined) throw new Error(`task "${payload.id}" not found`);
    const { result, events } = await ctx.taskBoards.setTaskStatus(boardId, {
      id: payload.id,
      status: payload.status,
      reason: payload.reason,
    });
    const refreshed = await ctx.taskBoards.listTasks(boardId);
    for (const task of refreshed) ctx.multicastBridge.emit('taskUpdated', task);
    for (const event of events) ctx.multicastBridge.emit('taskEventRecorded', event);
    return { id: result.id };
  };
}
