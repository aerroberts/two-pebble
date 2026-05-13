import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListEventsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listTaskEvents'>;
type Payload = ListEventsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const items = await ctx.taskBoards.listTaskEvents(payload.taskId);
    return { items };
  };
}
