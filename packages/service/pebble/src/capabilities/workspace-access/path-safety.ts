import fs from 'node:fs';
import path from 'node:path';

/**
 * Resolves a caller-supplied path inside the agent's workspace and rejects
 * anything that would escape. Rules:
 *   - The input must not be absolute.
 *   - After path.resolve, the result must sit inside `workspacePath`.
 *   - If a parent dir along the resolved path is a symlink, the real
 *     resolved target must also sit inside `workspacePath`.
 * Throws a `Error` with a model-actionable message on violation.
 */
export function resolveWorkspacePath(workspacePath: string, userPath: string): string {
  if (userPath.length === 0) {
    throw new Error('Path is required.');
  }
  if (path.isAbsolute(userPath)) {
    throw new Error(`Absolute paths are not allowed: "${userPath}". Use a path relative to the workspace.`);
  }
  const workspaceRoot = path.resolve(workspacePath);
  const resolved = path.resolve(workspaceRoot, userPath);
  if (!isInside(workspaceRoot, resolved)) {
    throw new Error(`Path escapes the workspace: "${userPath}".`);
  }
  // Real-path check defends against symlinks the workspace itself holds.
  // We only check ancestors that exist; the file itself may not.
  const realAncestor = findExistingAncestor(resolved);
  const realPath = fs.realpathSync(realAncestor);
  const tail = path.relative(realAncestor, resolved);
  const realResolved = tail.length === 0 ? realPath : path.resolve(realPath, tail);
  if (!isInside(workspaceRoot, realResolved)) {
    throw new Error(`Path resolves outside the workspace via a symlink: "${userPath}".`);
  }
  return resolved;
}

function isInside(root: string, candidate: string): boolean {
  const rel = path.relative(root, candidate);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function findExistingAncestor(filePath: string): string {
  let current = filePath;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) {
      return current;
    }
    current = parent;
  }
  return current;
}
