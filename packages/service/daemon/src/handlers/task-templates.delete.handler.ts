import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteTaskTemplate'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    await ctx.datastore.taskBoards.templates.delete(payload);
    ctx.multicastBridge.emit('taskTemplateDeleted', { id: payload.id });
    return { id: payload.id };
  };
}
