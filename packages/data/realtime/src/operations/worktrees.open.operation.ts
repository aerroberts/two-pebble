import type { RealtimeOperationContext } from '../types';

export function openWorktreeOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('openWorktree');
}
