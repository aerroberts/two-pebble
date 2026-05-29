import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'addTaskComment'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    const event = await ctx.taskBoards.recordCommentEvent({ taskId: payload.taskId, body: payload.body });
    ctx.events.emit('taskEventRecorded', event);
    return { id: event.id };
  };
}
