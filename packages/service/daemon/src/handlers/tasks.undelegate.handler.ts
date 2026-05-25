import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UndelegateTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'undelegateTask'>;
type Payload = UndelegateTaskOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const task = await findTaskRow(ctx, payload.taskId);
    if (task.ownerId === null) {
      throw new Error(`task "${payload.taskId}" has no owner`);
    }
    const updated = await ctx.taskBoards.setTaskOwner(payload.taskId, null);
    const undelegationEvent = await ctx.taskBoards.recordUndelegationEvent({
      taskId: payload.taskId,
      agentId: task.ownerId,
      reason: 'manual: undelegated',
    });
    ctx.events.emit('taskEventRecorded', undelegationEvent);
    const refreshed = await ctx.taskBoards.listTasks(updated.boardId);
    for (const entry of refreshed) {
      ctx.events.emit('taskUpdated', entry);
    }
    return { id: payload.taskId };
  };
}

interface MinimalTaskRow {
  id: string;
  boardId: string;
  ownerId: string | null;
}

async function findTaskRow(ctx: DaemonHandlerContext, taskId: string): Promise<MinimalTaskRow> {
  const boards = await ctx.datastore.taskBoards.list({});
  for (const board of boards.items) {
    const tasks = await ctx.datastore.taskBoards.tasks.list({ boardId: board.id });
    const found = tasks.items.find((task) => task.id === taskId);
    if (found !== undefined) {
      return found as MinimalTaskRow;
    }
  }
  throw new Error(`task "${taskId}" not found`);
}
