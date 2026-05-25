import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteTaskTemplateDeliverable'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    await ctx.datastore.taskBoards.templates.deliverables.delete(payload);
    ctx.events.emit('taskTemplateDeliverableDeleted', { id: payload.id });
    return { id: payload.id };
  };
}
