import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreatePoolOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createTaskPool'>;
type Payload = CreatePoolOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.taskBoards.createPool({
      boardId: payload.boardId,
      parentPoolId: payload.parentPoolId,
      name: payload.name,
      dependsOn: payload.dependsOn,
    });
    ctx.multicastBridge.emit('taskPoolUpdated', record);
    return { id: record.id };
  };
}
