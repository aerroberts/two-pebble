import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  pollableBefore?: number;
  limit?: number;
  offset?: number;
};

export function trackedPrsListOpenOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput = {}) {
    return ctx.datastore.trackedPrs.list({
      limit: input.limit,
      offset: input.offset,
      pollableBefore: input.pollableBefore,
      state: ['mergeable', 'unmergeable'],
    });
  };
}
