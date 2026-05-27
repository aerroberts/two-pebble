import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListAgentsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listAgents'>;
type ListAgentsPayload = ListAgentsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListAgentsPayload) {
    return ctx.datastore.agent.list({
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
      projectId: payload.projectId,
    });
  };
}
