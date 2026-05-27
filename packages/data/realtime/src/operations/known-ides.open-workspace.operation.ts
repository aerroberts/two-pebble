import type { RealtimeOperationContext } from '../types';

export function openWorkspaceInIdeOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('openWorkspaceInIde');
}
