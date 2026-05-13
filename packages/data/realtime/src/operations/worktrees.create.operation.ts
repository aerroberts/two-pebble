import type { CreateWorktreeInput, WorktreeRecord } from '../states/worktrees/types';
import type { RealtimeOperationContext } from '../types';

/**
 * Awaits the daemon's worktree creation and returns the active record.
 * Lifecycle transitions (creating -> active / deleted) are still broadcast as
 * `worktreeUpdated` events so subscribers can show progress while this resolves.
 */
export function createWorktreeOperation(ctx: RealtimeOperationContext) {
  return async function createWorktree(payload: CreateWorktreeInput): Promise<WorktreeRecord> {
    return ctx.datastore.emit('createWorktree', payload);
  };
}
