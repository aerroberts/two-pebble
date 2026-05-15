import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteAgentRegistryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteAgentRegistry'>;
type DeleteAgentRegistryPayload = DeleteAgentRegistryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteAgentRegistryPayload) {
    const automations = await ctx.datastore.automations.list({
      agentRegistryId: payload.id,
      limit: 1000,
      offset: 0,
    });
    for (const automation of automations.items) {
      ctx.automations.unregister(automation.id);
      await ctx.datastore.automations.delete({ id: automation.id });
      ctx.multicastBridge.emit('automationDeleted', { id: automation.id });
    }
    const deleted = await ctx.datastore.agentRegistries.delete(payload);

    ctx.multicastBridge.emit('agentRegistryDeleted', deleted);

    return deleted;
  };
}
