import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListAgentRegistriesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listAgentRegistries'>;
type ListAgentRegistriesPayload = ListAgentRegistriesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListAgentRegistriesPayload) {
    return ctx.datastore.agentRegistries.list({
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
      projectId: payload.projectId,
    });
  };
}
