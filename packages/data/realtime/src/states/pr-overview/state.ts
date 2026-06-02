import { LoadableRegistry } from '../../loadable';
import type { PrOverviewBoardRecord, PrOverviewState } from './types';

export function createPrOverviewState(): PrOverviewState {
  return {
    prOverview: new LoadableRegistry<PrOverviewBoardRecord>(),
  };
}
