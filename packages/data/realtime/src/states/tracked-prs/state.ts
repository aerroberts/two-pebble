import { LoadableRegistry } from '../../loadable';
import type { TrackedPrRecord, TrackedPrsState } from './types';

export function createTrackedPrsState(): TrackedPrsState {
  return {
    trackedPrs: new LoadableRegistry<TrackedPrRecord>(),
  };
}
