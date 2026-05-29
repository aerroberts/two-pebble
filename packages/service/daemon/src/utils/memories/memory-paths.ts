import os from 'node:os';
import path from 'node:path';

/**
 * Returns the absolute path where the daemon stores a memory collection's
 * folder. Memory folders live under `~/.two-pebble/memories/{memoryId}`,
 * keyed by the immutable row id — the same id-keyed scheme worktrees use.
 */
export function buildMemoryPath(memoryId: string): string {
  return path.join(os.homedir(), '.two-pebble', 'memories', memoryId);
}

/**
 * Resolves a caller-supplied file path inside a memory folder and rejects
 * anything that escapes the folder via `..` or an absolute path. Returns
 * the absolute on-disk path. Throws a model-actionable error on violation.
 */
export function resolveMemoryFilePath(root: string, file: string): string {
  const abs = path.resolve(root, file);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    throw new Error('path escapes memory folder');
  }
  return abs;
}
