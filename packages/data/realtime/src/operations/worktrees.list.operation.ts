import type { RealtimeOperationContext } from '../types';

export function listWorktreesOperation(ctx: RealtimeOperationContext) {
  return async function listWorktrees() {
    if (ctx.datastore.state.worktrees.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ worktrees: ctx.datastore.state.worktrees.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listWorktrees', { limit: 50, offset: 0 });
      ctx.datastore.patch({ worktrees: ctx.datastore.state.worktrees.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ worktrees: ctx.datastore.state.worktrees.withStatus('error') });
      throw error;
    }
  };
}
