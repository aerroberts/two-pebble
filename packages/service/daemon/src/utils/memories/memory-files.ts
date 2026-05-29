import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveMemoryFilePath } from './memory-paths';

const INDEX_FILE = 'index.md';

export interface MemoryFileEntry {
  path: string;
  sizeBytes: number;
  updatedAt: number;
}

/**
 * Recursively lists every file inside a memory folder, returning paths
 * relative to the folder root using POSIX separators so the wire shape is
 * stable across platforms. Directories are descended but not themselves
 * listed. The folder is the single source of truth — there is no DB
 * mirror to reconcile.
 */
export async function listMemoryFiles(root: string): Promise<string[]> {
  const entries = await listMemoryFileEntries(root);
  return entries.map((entry) => entry.path);
}

/**
 * Recursively lists every file inside a memory folder with metadata needed
 * by the UI file table.
 */
export async function listMemoryFileEntries(root: string): Promise<MemoryFileEntry[]> {
  const out: MemoryFileEntry[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      if (entry.isFile()) {
        const stat = await fs.stat(absolute);
        out.push({
          path: path.relative(root, absolute).split(path.sep).join('/'),
          sizeBytes: stat.size,
          updatedAt: stat.mtimeMs,
        });
      }
    }
  }

  await walk(root);
  out.sort((left, right) => left.path.localeCompare(right.path));
  return out;
}

/**
 * Reads a single file inside a memory folder, sandboxed to the root.
 */
export async function readMemoryFile(root: string, file: string): Promise<string> {
  const absolute = resolveMemoryFilePath(root, file);
  return fs.readFile(absolute, 'utf8');
}

/**
 * Writes a single file inside a memory folder, sandboxed to the root.
 * Parent directories are created as needed.
 */
export async function writeMemoryFile(root: string, file: string, body: string): Promise<void> {
  const absolute = resolveMemoryFilePath(root, file);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, body);
}

/**
 * Writes the starter `index.md` so the index-exists invariant holds from
 * birth. The curated index is the agent-facing map of the collection.
 */
export async function seedIndex(root: string, name: string): Promise<void> {
  const body = [
    `# ${name}`,
    '',
    'This is a memory collection — a folder of markdown files the agent can read and write.',
    '',
    'Use this index as a curated map of what lives here. Add entries as you create files.',
    '',
  ].join('\n');
  await fs.writeFile(path.join(root, INDEX_FILE), body);
}

export { INDEX_FILE };
