import type { TrackedPrRecord } from './tracked-prs.types';

export interface TrackedPrRecordedEvent {
  name: 'trackedPrRecorded';
  payload: TrackedPrRecord;
}
