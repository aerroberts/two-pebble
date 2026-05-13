import type { RealtimeOperationContext } from '../../types';

export function listenToWorktrees(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('worktreeUpdated', (worktree) => {
    ctx.datastore.patch({
      worktrees: ctx.datastore.state.worktrees.withItem(worktree.id, worktree, 'ready'),
    });
  });
}
