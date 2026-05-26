import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitResponse } from '../../types';

export type TrackedPrRecord = RealtimeEmitResponse<'listTrackedPrs'>['items'][number];

export interface TrackedPrsState {
  trackedPrs: LoadableRegistry<TrackedPrRecord>;
}
