import type { RealtimeOperationContext } from '../types';

export function deleteWorktreeOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmitLifecycle('deleteWorktree', {
    before: (payload) => {
      const worktree = ctx.datastore.state.worktrees.getItem(payload.id)?.value;
      if (worktree === undefined || worktree === null) {
        return;
      }

      ctx.datastore.patch({
        worktrees: ctx.datastore.state.worktrees.withItem(payload.id, worktree, 'loading'),
      });
    },
    error: (payload) => {
      const worktree = ctx.datastore.state.worktrees.getItem(payload.id)?.value;
      if (worktree === undefined || worktree === null) {
        return;
      }

      ctx.datastore.patch({
        worktrees: ctx.datastore.state.worktrees.withItem(payload.id, worktree, 'ready'),
      });
    },
  });
}
