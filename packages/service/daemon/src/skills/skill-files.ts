import fs from 'node:fs/promises';
import path from 'node:path';
import { MAX_ENTRIES, validateSkillFolder } from './skill-folder';

/**
 * Recursively lists files in a skill folder. The UI uses relative POSIX paths
 * to build a loose tree without reading file bodies during navigation.
 */
export async function listSkillFiles(root: string): Promise<string[]> {
  const normalized = validateSkillFolder(root);
  const out: string[] = [];

  async function walk(dir: string): Promise<void> {
    if (out.length >= MAX_ENTRIES) {
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (out.length >= MAX_ENTRIES) {
        return;
      }
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      if (entry.isFile()) {
        out.push(path.relative(normalized, absolute).split(path.sep).join('/'));
      }
    }
  }

  await walk(normalized);
  return out.sort((left, right) => left.localeCompare(right));
}

/**
 * Reads one file from a skill folder while rejecting absolute paths and parent
 * traversal that would escape the skill root.
 */
export async function readSkillFile(root: string, file: string): Promise<string> {
  const normalized = validateSkillFolder(root);
  const absolute = path.resolve(normalized, file);
  if (absolute !== normalized && !absolute.startsWith(normalized + path.sep)) {
    throw new Error('path escapes skill folder');
  }
  return fs.readFile(absolute, 'utf8');
}
