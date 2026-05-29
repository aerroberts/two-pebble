import { logger } from '@two-pebble/logger';
import { Cell } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { resolveReferenceCells } from './resolve-document-reference-cells';
import { taskDescriptionToCells } from './task-description-cells';

type DelegateTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'delegateTask'>;
type Payload = DelegateTaskOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const task = await findTask(ctx, payload.taskId);
    const registry = await ctx.datastore.agentRegistries.read({ id: payload.agentRegistryId });
    const taskDescription = task.description ?? '';
    const descriptionCells = taskDescriptionToCells({
      description: taskDescription,
      descriptionContent: task.descriptionContent ?? null,
    });
    const message = [
      'Please complete the assigned task.',
      '',
      `Task: ${task.name}`,
      `Task id: ${task.id}`,
      `Board id: ${task.boardId}`,
      taskDescription.length > 0 ? `Description:\n${taskDescription}` : undefined,
      task.additionalContext.length > 0 ? `Additional context:\n${task.additionalContext}` : undefined,
    ]
      .filter((line): line is string => line !== undefined)
      .join('\n');
    const rawCells = [
      Cell.text(
        [
          'Please complete the assigned task.',
          '',
          `Task: ${task.name}`,
          `Task id: ${task.id}`,
          `Board id: ${task.boardId}`,
        ].join('\n'),
      ),
      ...(descriptionCells.length > 0 ? [Cell.header2('Description'), ...descriptionCells] : []),
      ...(task.additionalContext.length > 0
        ? [Cell.header2('Additional context'), Cell.text(task.additionalContext)]
        : []),
    ];
    const cells = await resolveReferenceCells({
      cells: rawCells,
      datastore: ctx.datastore,
      logger,
    });
    const launched = await ctx.agentRegistry.launch({
      agentRegistryId: payload.agentRegistryId,
      message,
      cells,
      projectId: task.projectId,
    });
    const taskAssignedTrace = await ctx.datastore.agent.traces.record({
      agentId: launched.id,
      data: {
        taskId: task.id,
        taskName: task.name,
        taskDescription,
        boardId: task.boardId,
      },
      id: crypto.randomUUID(),
      orderId: 0,
      type: 'task-assigned',
    });
    ctx.events.emit('agentTraceRecorded', taskAssignedTrace);
    const updated = await ctx.taskBoards.setTaskOwner(payload.taskId, launched.id);
    const delegationEvent = await ctx.taskBoards.recordDelegationEvent({
      taskId: payload.taskId,
      agentId: launched.id,
      agentRegistryId: payload.agentRegistryId,
      agentName: registry.name,
      reason: `manual: delegated to ${registry.name}`,
    });
    ctx.events.emit('taskEventRecorded', delegationEvent);
    const refreshed = await ctx.taskBoards.listTasks(updated.boardId);
    for (const entry of refreshed) {
      ctx.events.emit('taskUpdated', entry);
    }
    const { events: statusEvents } = await ctx.taskBoards.setTaskStatus(updated.boardId, {
      id: payload.taskId,
      status: 'working',
      reason: `manual: delegated to ${registry.name}`,
    });
    for (const event of statusEvents) {
      ctx.events.emit('taskEventRecorded', event);
    }
    const afterStatus = await ctx.taskBoards.listTasks(updated.boardId);
    for (const entry of afterStatus) {
      ctx.events.emit('taskUpdated', entry);
    }
    return { agentId: launched.id };
  };
}

interface MinimalTaskRow {
  id: string;
  boardId: string;
  projectId: string;
  name: string;
  description: string | null;
  descriptionContent: string | null;
  additionalContext: string;
  ownerId: string | null;
}

async function findTask(ctx: DaemonHandlerContext, taskId: string): Promise<MinimalTaskRow> {
  const boards = await ctx.datastore.taskBoards.list({});
  for (const board of boards.items) {
    const tasks = await ctx.datastore.taskBoards.tasks.list({ boardId: board.id });
    const found = tasks.items.find((task) => task.id === taskId);
    if (found !== undefined) {
      return { ...(found as Omit<MinimalTaskRow, 'projectId'>), projectId: board.projectId };
    }
  }
  throw new Error(`task "${taskId}" not found`);
}
