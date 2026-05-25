import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '@two-pebble/logger';
import type { CreateWorktreeContext } from '../../types';
import { gitWorktreeAdd } from './git-worktree';
import { buildWorktreePath } from './worktree-paths';

interface CreateWorktreeInput {
  branch: string;
  repositoryId: string;
}

/**
 * Drives the full worktree creation lifecycle and returns the active record.
 * The daemon handler and the agent-launch path share this so both surface
 * worktreeUpdated events as the lifecycle transitions.
 */
export async function createWorktreeForRepository(ctx: CreateWorktreeContext, input: CreateWorktreeInput) {
  const repository = await ctx.datastore.repositories.read({ id: input.repositoryId });

  const placeholder = await ctx.datastore.worktrees.create({
    branch: input.branch,
    path: '',
    repositoryId: repository.id,
  });

  const worktreePath = buildWorktreePath(repository.id, placeholder.id);
  const creating = await ctx.datastore.worktrees.update({
    id: placeholder.id,
    path: worktreePath,
    status: 'creating',
  });
  ctx.events.emit('worktreeUpdated', creating);

  try {
    await fs.mkdir(path.dirname(worktreePath), { recursive: true });
    await gitWorktreeAdd({
      baseRef: repository.baseBranch,
      branch: input.branch,
      cwd: repository.path,
      worktreePath,
    });
  } catch (error) {
    logger.warn('worktree creation failed', {
      error: error instanceof Error ? error : String(error),
      worktreeId: placeholder.id,
    });
    const failed = await ctx.datastore.worktrees.update({ id: placeholder.id, status: 'deleted' });
    ctx.events.emit('worktreeUpdated', failed);
    throw error;
  }

  const active = await ctx.datastore.worktrees.update({ id: placeholder.id, status: 'active' });
  ctx.events.emit('worktreeUpdated', active);
  return active;
}
