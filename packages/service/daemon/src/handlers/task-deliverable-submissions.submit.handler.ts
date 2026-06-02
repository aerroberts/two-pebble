import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'submitTaskDeliverable'>;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Operation['request']) {
    const result = await ctx.taskBoards.submitDeliverable(payload);
    // A `pr_url` attach returns a tracked PR (the GitHub service already emits
    // `trackedPrRecorded` and parks the task in `waiting`); only a real text
    // submission carries a submission record to broadcast.
    if (result.kind === 'tracked_pr') {
      return { trackedPr: result.trackedPr };
    }
    ctx.events.emit('taskDeliverableSubmissionRecorded', result.submission);
    return { submission: result.submission };
  };
}
