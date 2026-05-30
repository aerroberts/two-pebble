import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'submitTaskDeliverable'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    const submission = await ctx.taskBoards.submitDeliverable(payload);
    ctx.events.emit('taskDeliverableSubmissionRecorded', submission);
    return { submission };
  };
}
