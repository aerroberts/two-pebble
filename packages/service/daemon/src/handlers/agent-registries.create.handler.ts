import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateAgentRegistryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createAgentRegistry'>;
type CreateAgentRegistryPayload = CreateAgentRegistryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateAgentRegistryPayload) {
    const registry = await ctx.datastore.agentRegistries.create(payload);

    ctx.multicastBridge.emit('agentRegistryUpdated', registry);

    return { id: registry.id };
  };
}
