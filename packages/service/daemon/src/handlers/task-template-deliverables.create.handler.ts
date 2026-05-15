import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createTaskTemplateDeliverable'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    const deliverable = await ctx.datastore.taskBoards.templates.deliverables.create(payload);
    ctx.multicastBridge.emit('taskTemplateDeliverableUpdated', deliverable);
    return { deliverable };
  };
}
