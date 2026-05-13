import { spawn } from 'node:child_process';

interface GitWorktreeOptions {
  /** Branch name to create or reset for the new worktree. */
  branch: string;
  /** Working directory of the source clone. */
  cwd: string;
  /** Where the worktree should land on disk. */
  worktreePath: string;
  /** Ref the new branch is cut from (e.g. the repo's base branch like `main`). */
  baseRef: string;
}

interface GitWorktreeRemoveOptions {
  cwd: string;
  worktreePath: string;
}

/**
 * Runs `git worktree add -B {branch} {path} {resolvedBaseRef}` from the source clone.
 * The base ref is resolved (`{branch}` or `origin/{branch}`) before invoking
 * worktree add. Resolves once git exits successfully; rejects with stderr on
 * failure. The repository is expected to have at least one commit on the base
 * branch — we do not seed empty repos for the caller.
 */
export async function gitWorktreeAdd(options: GitWorktreeOptions): Promise<void> {
  const baseRef = await resolveBaseRef(options.cwd, options.baseRef);
  await runGit(options.cwd, ['worktree', 'add', '-B', options.branch, options.worktreePath, baseRef]);
}

/**
 * Removes a worktree from the host repository's metadata and the on-disk path.
 * Uses `--force` so worktrees with local changes still get reclaimed.
 */
export async function gitWorktreeRemove(options: GitWorktreeRemoveOptions): Promise<void> {
  await runGit(options.cwd, ['worktree', 'remove', '--force', options.worktreePath]);
}

/**
 * Returns a ref that resolves in the source clone.
 * Tries the configured branch as-is, then `origin/{branch}` for clones that
 * have not pulled the local tracking branch yet.
 */
async function resolveBaseRef(cwd: string, branch: string): Promise<string> {
  const candidates = [branch, `origin/${branch}`];
  for (const candidate of candidates) {
    if (await hasRef(cwd, candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `No ref matching '${branch}' or 'origin/${branch}' exists in ${cwd}. ` +
      `Update the repository's base branch in settings or fetch the remote.`,
  );
}

async function hasRef(cwd: string, ref: string): Promise<boolean> {
  try {
    await runGit(cwd, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function runGit(cwd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`git ${args.join(' ')} failed: ${stderr.trim() || `exit code ${code}`}`));
    });
  });
}
