import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListTasksOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listTasks'>;
type Payload = ListTasksOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const items = await ctx.taskBoards.listTasks(payload.boardId);
    return { items };
  };
}
