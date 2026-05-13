import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeletePoolOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteTaskPool'>;
type Payload = DeletePoolOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const pool = await readPoolBoard(ctx, payload.id);
    const events = await ctx.taskBoards.deletePool(pool.boardId, payload.id);
    ctx.multicastBridge.emit('taskPoolDeleted', { id: payload.id, boardId: pool.boardId });
    for (const event of events) {
      ctx.multicastBridge.emit('taskEventRecorded', event);
    }
    return { id: payload.id };
  };
}

async function readPoolBoard(ctx: DaemonHandlerContext, poolId: string) {
  const all = await ctx.datastore.taskBoards.list({});
  for (const board of all.items) {
    const pools = await ctx.datastore.taskBoards.pools.list({ boardId: board.id });
    const found = pools.items.find((pool) => pool.id === poolId);
    if (found !== undefined) {
      return found;
    }
  }
  throw new Error(`task pool "${poolId}" not found`);
}
