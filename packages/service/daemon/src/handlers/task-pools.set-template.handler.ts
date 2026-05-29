import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type SetPoolTemplateOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'setTaskPoolTemplate'>;
type Payload = SetPoolTemplateOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.taskBoards.setPoolTemplate(payload.id, payload.defaultTemplateId);
    ctx.events.emit('taskPoolUpdated', record);
    return { id: record.id };
  };
}
