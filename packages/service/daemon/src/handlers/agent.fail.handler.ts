import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type FailAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'failAgent'>;
type FailAgentPayload = FailAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: FailAgentPayload) {
    const record = await ctx.datastore.agent.fail(payload);
    ctx.multicastBridge.emit('agentRecorded', record);
    const sync = await ctx.taskBoards.syncOwnedTasksFromAgentStatus({
      agentId: record.id,
      agentStatus: 'failed',
      reason: `auto: agent ${record.name} failed`,
    });
    for (const event of sync.events) {
      ctx.multicastBridge.emit('taskEventRecorded', event);
    }
    for (const task of sync.tasks) {
      ctx.multicastBridge.emit('taskUpdated', task);
    }
    return { id: record.id };
  };
}
