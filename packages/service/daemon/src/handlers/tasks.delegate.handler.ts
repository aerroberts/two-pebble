import type { TaskDeliverableRecord } from '@two-pebble/datastore';
import { logger } from '@two-pebble/logger';
import { Cell } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { resolveReferenceCells } from './resolve-document-reference-cells';
import { taskDescriptionToCells } from './task-description-cells';

type DelegateTaskOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'delegateTask'>;
type Payload = DelegateTaskOperation['request'];

/**
 * Explains, to a freshly launched agent, that the task lives on a Two Pebble
 * board and that the board is interactable from its shell via the `peb` CLI.
 * Kept terse: it points the agent at the commands it needs to report progress
 * and read its requirements rather than restating the whole CLI surface.
 */
function howTheBoardWorks(taskId: string, boardId: string): string {
  return [
    'This task lives on a Two Pebble task board — the shared source of truth for the work, its status, and its requirements.',
    'You can inspect and update the board from your shell with the `peb` CLI:',
    `- \`peb task list --board ${boardId}\` — see every task on this board`,
    `- \`peb task set-status --task ${taskId} --status <working|waiting|success|failure|canceled> --reason "<why>"\` — report progress`,
    `- \`peb task comment --task ${taskId} --body "<note>"\` — leave a note on the task`,
    `- \`peb task requirement-list --task ${taskId}\` — re-read the requirements you must satisfy`,
  ].join('\n');
}

/**
 * Serializes a task's requirements (deliverables) into a numbered, stable list
 * so the assigned agent knows exactly what must be produced before the task is
 * complete. Order follows the board's own ordering (orderIndex, then created).
 */
function describeRequirements(deliverables: TaskDeliverableRecord[]): string {
  const lines = [
    'This task has requirements that must be completed before you mark it successful:',
    '',
  ];
  deliverables.forEach((deliverable, index) => {
    lines.push(`${index + 1}. ${deliverable.name} (type: ${deliverable.type}, requirement id: ${deliverable.id})`);
    if (deliverable.description.length > 0) {
      lines.push(`   ${deliverable.description}`);
    }
  });
  return lines.join('\n');
}

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const task = await findTask(ctx, payload.taskId);
    const registry = await ctx.datastore.agentRegistries.read({ id: payload.agentRegistryId });
    const taskDescription = task.description ?? '';
    const descriptionCells = taskDescriptionToCells({
      description: taskDescription,
      descriptionContent: task.descriptionContent ?? null,
    });
    const { items: deliverables } = await ctx.datastore.taskBoards.deliverables.list({ taskId: task.id });
    const boardGuidance = howTheBoardWorks(task.id, task.boardId);
    const requirementsText = deliverables.length > 0 ? describeRequirements(deliverables) : undefined;
    const message = [
      'Please complete the assigned task.',
      '',
      `Task: ${task.name}`,
      `Task id: ${task.id}`,
      `Board id: ${task.boardId}`,
      taskDescription.length > 0 ? `Description:\n${taskDescription}` : undefined,
      task.additionalContext.length > 0 ? `Additional context:\n${task.additionalContext}` : undefined,
      `\nHow the board works:\n${boardGuidance}`,
      requirementsText === undefined ? undefined : `\nRequirements:\n${requirementsText}`,
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
      Cell.header2('How the board works'),
      Cell.text(boardGuidance),
      ...(requirementsText === undefined ? [] : [Cell.header2('Requirements'), Cell.text(requirementsText)]),
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
