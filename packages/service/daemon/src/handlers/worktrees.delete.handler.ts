import fs from 'node:fs/promises';
import { logger } from '@two-pebble/logger';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { gitWorktreeRemove } from '../utils/worktrees/git-worktree';

type DeleteWorktreeOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteWorktree'>;
type DeleteWorktreePayload = DeleteWorktreeOperation['request'];

/**
 * Reclaims an active worktree.
 * Reads the row, removes the on-disk worktree (best-effort), then marks the
 * row `deleted` and broadcasts the lifecycle change. The row is kept so
 * deleted worktrees can be listed for audit until the user purges them.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteWorktreePayload) {
    const worktree = await ctx.datastore.worktrees.read({ id: payload.id });

    if (worktree.status === 'active' && worktree.path !== '') {
      try {
        const repository = await ctx.datastore.repositories.read({ id: worktree.repositoryId });
        await gitWorktreeRemove({ cwd: repository.path, worktreePath: worktree.path });
      } catch (error) {
        logger.warn('git worktree remove failed; falling back to fs.rm', {
          error: error instanceof Error ? error : String(error),
          worktreeId: worktree.id,
        });
        await fs.rm(worktree.path, { force: true, recursive: true }).catch(() => undefined);
      }
    }

    const deleted = await ctx.datastore.worktrees.update({ id: payload.id, status: 'deleted' });
    ctx.events.emit('worktreeUpdated', deleted);

    return { id: payload.id };
  };
}
