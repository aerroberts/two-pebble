import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitResponse } from '../../types';

export type PrOverviewBoardRecord = RealtimeEmitResponse<'listPrOverview'>['boards'][number];

export interface PrOverviewState {
  prOverview: LoadableRegistry<PrOverviewBoardRecord>;
}
