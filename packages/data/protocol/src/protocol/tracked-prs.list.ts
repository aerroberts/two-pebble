import type { TrackedPrRecord, TrackedPrState } from './tracked-prs.recorded';

export interface TrackedPrsListOperation {
  name: 'listTrackedPrs';
  request: {
    taskId?: string;
    state?: TrackedPrState[];
    limit?: number;
    offset?: number;
  };
  response: {
    items: TrackedPrRecord[];
  };
}
