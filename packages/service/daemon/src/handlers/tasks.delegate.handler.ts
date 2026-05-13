import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DelegateTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'delegateTask'>;
type Payload = DelegateTaskOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const task = await findTask(ctx, payload.taskId);
    const registry = await ctx.datastore.agentRegistries.read({ id: payload.agentRegistryId });
    const message = buildDelegateMessage(task.name, task.description ?? '');
    const launched = await ctx.agentRegistry.launch({
      agentRegistryId: payload.agentRegistryId,
      message,
    });
    const taskAssignedTrace = await ctx.datastore.agent.traces.record({
      agentId: launched.id,
      data: { taskId: task.id, taskName: task.name, boardId: task.boardId },
      id: crypto.randomUUID(),
      orderId: 0,
      type: 'task-assigned',
    });
    ctx.multicastBridge.emit('agentTraceRecorded', taskAssignedTrace);
    const updated = await ctx.taskBoards.setTaskOwner(payload.taskId, launched.id);
    const delegationEvent = await ctx.taskBoards.recordDelegationEvent({
      taskId: payload.taskId,
      agentId: launched.id,
      agentRegistryId: payload.agentRegistryId,
      agentName: registry.name,
      reason: `manual: delegated to ${registry.name}`,
    });
    ctx.multicastBridge.emit('taskEventRecorded', delegationEvent);
    const refreshed = await ctx.taskBoards.listTasks(updated.boardId);
    for (const entry of refreshed) {
      ctx.multicastBridge.emit('taskUpdated', entry);
    }
    const { events: statusEvents } = await ctx.taskBoards.setTaskStatus(updated.boardId, {
      id: payload.taskId,
      status: 'working',
      reason: `manual: delegated to ${registry.name}`,
    });
    for (const event of statusEvents) {
      ctx.multicastBridge.emit('taskEventRecorded', event);
    }
    const afterStatus = await ctx.taskBoards.listTasks(updated.boardId);
    for (const entry of afterStatus) {
      ctx.multicastBridge.emit('taskUpdated', entry);
    }
    return { agentId: launched.id };
  };
}

interface MinimalTaskRow {
  id: string;
  boardId: string;
  name: string;
  description: string | null;
  ownerId: string | null;
}

async function findTask(ctx: DaemonHandlerContext, taskId: string): Promise<MinimalTaskRow> {
  const boards = await ctx.datastore.taskBoards.list({});
  for (const board of boards.items) {
    const tasks = await ctx.datastore.taskBoards.tasks.list({ boardId: board.id });
    const found = tasks.items.find((task) => task.id === taskId);
    if (found !== undefined) {
      return found as MinimalTaskRow;
    }
  }
  throw new Error(`task "${taskId}" not found`);
}

function buildDelegateMessage(name: string, description: string): string {
  const lines = [`Please do this task: ${name}`];
  if (description.trim().length > 0) {
    lines.push('', description);
  }
  return lines.join('\n');
}
