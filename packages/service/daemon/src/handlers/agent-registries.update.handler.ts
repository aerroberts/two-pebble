import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateAgentRegistryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateAgentRegistry'>;
type UpdateAgentRegistryPayload = UpdateAgentRegistryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: UpdateAgentRegistryPayload) {
    const registry = await ctx.datastore.agentRegistries.update(payload);

    ctx.multicastBridge.emit('agentRegistryUpdated', registry);

    return { id: registry.id };
  };
}
