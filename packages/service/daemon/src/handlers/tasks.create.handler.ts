import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createTask'>;
type Payload = CreateTaskOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const { result, events } = await ctx.taskBoards.createTask({
      boardId: payload.boardId,
      poolId: payload.poolId,
      name: payload.name,
      description: payload.description ?? '',
      descriptionContent: payload.descriptionContent,
      dependsOn: payload.dependsOn,
      templateId: payload.templateId ?? null,
    });
    ctx.events.emit('taskUpdated', result);
    const { items: deliverables } = await ctx.datastore.taskBoards.deliverables.list({ taskId: result.id });
    for (const deliverable of deliverables) {
      ctx.events.emit('taskDeliverableUpdated', deliverable);
    }
    for (const event of events) {
      ctx.events.emit('taskEventRecorded', event);
    }
    return { id: result.id };
  };
}
