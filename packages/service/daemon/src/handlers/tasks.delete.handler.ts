import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteTask'>;
type Payload = DeleteTaskOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const boards = await ctx.datastore.taskBoards.list({});
    let boardId: string | undefined;
    for (const board of boards.items) {
      const items = await ctx.datastore.taskBoards.tasks.list({ boardId: board.id });
      if (items.items.some((task) => task.id === payload.id)) {
        boardId = board.id;
        break;
      }
    }
    if (boardId === undefined) {
      throw new Error(`task "${payload.id}" not found`);
    }
    const events = await ctx.taskBoards.deleteTask(boardId, payload.id);
    ctx.events.emit('taskDeleted', { id: payload.id, boardId });
    const refreshed = await ctx.taskBoards.listTasks(boardId);
    for (const task of refreshed) {
      ctx.events.emit('taskUpdated', task);
    }
    for (const event of events) {
      ctx.events.emit('taskEventRecorded', event);
    }
    return { id: payload.id };
  };
}
