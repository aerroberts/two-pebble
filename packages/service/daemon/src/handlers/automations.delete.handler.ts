import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteAutomation'>;
type Payload = Operation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    ctx.automations.unregister(payload.id);
    const deleted = await ctx.datastore.automations.delete(payload);
    ctx.multicastBridge.emit('automationDeleted', deleted);
    return deleted;
  };
}
