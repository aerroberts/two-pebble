import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteDepOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteTaskDependency'>;
type Payload = DeleteDepOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const boards = await ctx.datastore.taskBoards.list({});
    let boardId: string | undefined;
    for (const board of boards.items) {
      const deps = await ctx.datastore.taskBoards.dependencies.list({ boardId: board.id });
      if (deps.items.some((edge) => edge.fromId === payload.fromId && edge.toId === payload.toId)) {
        boardId = board.id;
        break;
      }
    }
    if (boardId === undefined) {
      throw new Error(`task dependency not found`);
    }
    const events = await ctx.taskBoards.deleteDependency(boardId, payload);
    ctx.multicastBridge.emit('taskDependencyDeleted', { boardId, fromId: payload.fromId, toId: payload.toId });
    const refreshed = await ctx.taskBoards.listTasks(boardId);
    for (const task of refreshed) {
      ctx.multicastBridge.emit('taskUpdated', task);
    }
    for (const event of events) {
      ctx.multicastBridge.emit('taskEventRecorded', event);
    }
    return { fromId: payload.fromId, toId: payload.toId };
  };
}
