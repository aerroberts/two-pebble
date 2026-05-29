import fs from 'node:fs/promises';
import { INDEX_FILE, listMemoryFiles } from './memory-files';

export interface MemoryNavigation {
  /** Contents of `index.md`, or undefined when the file is missing. */
  index?: string;
  /** Shallow file listing relative to the folder root. */
  files: string[];
  /** True when the folder itself is missing on disk (orphaned row). */
  unavailable: boolean;
}

/**
 * Gathers read-only navigation for a memory folder: the curated `index.md`
 * plus a file tree. This never writes — index regeneration belongs to the
 * create/edit handlers. A missing folder yields `unavailable: true`; a
 * missing `index.md` yields a tree with no index, never a throw.
 */
export async function gatherMemoryNavigation(root: string): Promise<MemoryNavigation> {
  let files: string[];
  try {
    files = await listMemoryFiles(root);
  } catch {
    return { files: [], unavailable: true };
  }

  let index: string | undefined;
  try {
    index = await fs.readFile(`${root}/${INDEX_FILE}`, 'utf8');
  } catch {
    index = undefined;
  }

  return { ...(index === undefined ? {} : { index }), files, unavailable: false };
}
