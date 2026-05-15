import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type Operation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createAutomation'>;
type Payload = Operation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const automation = await ctx.datastore.automations.create(payload);
    ctx.automations.register(automation);
    ctx.multicastBridge.emit('automationUpdated', automation);
    return { id: automation.id };
  };
}
