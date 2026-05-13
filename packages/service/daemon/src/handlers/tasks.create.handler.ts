import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createTask'>;
type Payload = CreateTaskOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const { result, events } = await ctx.taskBoards.createTask({
      boardId: payload.boardId,
      poolId: payload.poolId,
      name: payload.name,
      dependsOn: payload.dependsOn,
    });
    ctx.multicastBridge.emit('taskUpdated', result);
    for (const event of events) ctx.multicastBridge.emit('taskEventRecorded', event);
    return { id: result.id };
  };
}
