import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createAgent'>;
type CreateAgentPayload = CreateAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateAgentPayload) {
    const record = await ctx.datastore.agent.create({
      ...payload,
      parentAgentId: payload.parentAgentId ?? null,
      workspaceId: 'legacy',
    });
    ctx.events.emit('agentRecorded', record);
    return { id: record.id };
  };
}
