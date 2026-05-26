import type { TrackedPrRecord, TrackedPrState } from './tracked-prs.types';

export interface TrackedPrsListOperation {
  name: 'listTrackedPrs';
  request: {
    taskId?: string;
    agentId?: string;
    states?: TrackedPrState[];
  };
  response: {
    items: TrackedPrRecord[];
  };
}
