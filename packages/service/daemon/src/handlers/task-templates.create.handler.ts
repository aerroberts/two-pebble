import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createTaskTemplate'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    const template = await ctx.datastore.taskBoards.templates.create(payload);
    ctx.multicastBridge.emit('taskTemplateUpdated', template);
    return { template };
  };
}
