import type { PrOverviewBoard, PrOverviewDeliverable, TrackedPrRecord } from '@two-pebble/protocol';
import type { DaemonHandlerContext } from '../types';

const TERMINAL_STATUSES = new Set(['success', 'failure', 'canceled']);

/**
 * Server-side read-model for the overview page. Walks every board (optionally
 * scoped to a project), keeps only non-terminal tasks that carry at least one
 * `pr_url` deliverable, and joins each to its tracked PR. Computed in one pass
 * so the UI never fans out per-task queries.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function listPrOverview(payload: { projectId?: string }): Promise<{ boards: PrOverviewBoard[] }> {
    const { items: boards } = await ctx.datastore.taskBoards.list(
      payload.projectId === undefined ? {} : { projectId: payload.projectId },
    );
    const result: PrOverviewBoard[] = [];
    for (const board of boards) {
      const tasks = await ctx.taskBoards.listTasks(board.id);
      const boardTasks: PrOverviewBoard['tasks'] = [];
      for (const task of tasks) {
        if (TERMINAL_STATUSES.has(task.status)) {
          continue;
        }
        const { items: deliverables } = await ctx.datastore.taskBoards.deliverables.list({ taskId: task.id });
        const prDeliverableDefs = deliverables.filter((deliverable) => deliverable.type === 'pr_url');
        if (prDeliverableDefs.length === 0) {
          continue;
        }
        const { items: trackedPrs } = await ctx.datastore.trackedPrs.list({ taskId: task.id });
        const prByDeliverable = new Map<string, TrackedPrRecord>(trackedPrs.map((pr) => [pr.deliverableId, pr]));
        const prDeliverables: PrOverviewDeliverable[] = prDeliverableDefs.map((deliverable) => ({
          deliverableId: deliverable.id,
          name: deliverable.name,
          pr: prByDeliverable.get(deliverable.id) ?? null,
        }));
        boardTasks.push({ task, prDeliverables });
      }
      if (boardTasks.length > 0) {
        result.push({ boardId: board.id, boardName: board.name, tasks: boardTasks });
      }
    }
    return { boards: result };
  };
}
