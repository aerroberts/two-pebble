import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateDepOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createTaskDependency'>;
type Payload = CreateDepOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const { result, events } = await ctx.taskBoards.createDependency(payload);
    ctx.events.emit('taskDependencyUpdated', result);
    const refreshed = await ctx.taskBoards.listTasks(payload.boardId);
    for (const task of refreshed) {
      ctx.events.emit('taskUpdated', task);
    }
    for (const event of events) {
      ctx.events.emit('taskEventRecorded', event);
    }
    return { id: result.id };
  };
}
