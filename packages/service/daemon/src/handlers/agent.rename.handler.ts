import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type RenameAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'renameAgent'>;
type Payload = RenameAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const record = await ctx.datastore.agent.rename({ id: payload.id, name: payload.name });
    ctx.events.emit('agentRecorded', {
      agentRegistryId: record.agentRegistryId ?? null,
      completedAt: record.completedAt,
      description: record.description,
      id: record.id,
      metadata: record.metadata,
      name: record.name,
      parentAgentId: record.parentAgentId ?? null,
      projectId: record.projectId,
      startedAt: record.startedAt,
      status: record.status,
      workspaceId: record.workspaceId,
    });
    return { id: record.id };
  };
}
