import type { ProtocolTaskRecord } from './tasks.list';
import type { TrackedPrRecord } from './tracked-prs.recorded';

/**
 * One `pr_url` deliverable on a task, paired with its tracked PR (or `null`
 * when no PR has been attached yet — an "undelivered" requirement).
 */
export interface PrOverviewDeliverable {
  deliverableId: string;
  name: string;
  pr: TrackedPrRecord | null;
}

/**
 * An incomplete task that carries at least one `pr_url` deliverable, with the
 * PR status of each. The UI groups these by `task.effectiveStatus`.
 */
export interface PrOverviewTask {
  task: ProtocolTaskRecord;
  prDeliverables: PrOverviewDeliverable[];
}

export interface PrOverviewBoard {
  boardId: string;
  boardName: string;
  tasks: PrOverviewTask[];
}

/**
 * Server-side read-model for the overview page: every board with its
 * non-terminal tasks that have PR requirements, joined to live PR status.
 * Computed in one pass on the daemon so the UI never has to fan out per-task
 * queries (the race that left the old overview blank).
 */
export interface PrOverviewListOperation {
  name: 'listPrOverview';
  request: {
    projectId?: string;
  };
  response: {
    boards: PrOverviewBoard[];
  };
}
