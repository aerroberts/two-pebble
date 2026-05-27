import type { TrackedPrRecord, TrackedPrState } from './tracked-prs.recorded';

export interface TrackedPrsListOperation {
  name: 'listTrackedPrs';
  request: {
    agentId?: string;
    taskId?: string;
    state?: TrackedPrState[];
    limit?: number;
    offset?: number;
  };
  response: {
    items: TrackedPrRecord[];
  };
}
