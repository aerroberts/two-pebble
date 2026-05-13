import type { RealtimeOperationContext } from '../types';

export function updateRepositoryOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('updateRepository');
}
