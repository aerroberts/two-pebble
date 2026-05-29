import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteTaskDeliverable'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    await ctx.datastore.taskBoards.deliverables.delete(payload);
    ctx.events.emit('taskDeliverableDeleted', { id: payload.id });
    return { id: payload.id };
  };
}
