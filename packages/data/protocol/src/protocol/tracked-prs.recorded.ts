export type TrackedPrState = 'mergeable' | 'pending' | 'unmergeable' | 'merged' | 'closed';

export interface TrackedPrCheckRun {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  url: string;
}

export interface TrackedPrRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  deliverableId: string;
  agentId: string;
  integrationId: string;
  repo: string;
  number: number;
  url: string;
  state: TrackedPrState;
  checks: TrackedPrCheckRun[];
  lastCheckedAt: number;
  lastEventAt: number | null;
  etag: string | null;
}

export interface TrackedPrRecordedEvent {
  name: 'trackedPrRecorded';
  payload: TrackedPrRecord;
}
