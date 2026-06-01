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
      // `pending` PRs are still open and must keep being polled until they
      // reach a terminal state, so they belong in the open set alongside
      // mergeable/unmergeable.
      state: ['mergeable', 'pending', 'unmergeable'],
    });
  };
}
