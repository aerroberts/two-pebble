import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteAgentRegistryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteAgentRegistry'>;
type DeleteAgentRegistryPayload = DeleteAgentRegistryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteAgentRegistryPayload) {
    const deleted = await ctx.datastore.agentRegistries.delete(payload);

    ctx.multicastBridge.emit('agentRegistryDeleted', deleted);

    return deleted;
  };
}
