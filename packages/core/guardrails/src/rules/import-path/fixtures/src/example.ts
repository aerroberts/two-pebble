import { readFile } from 'node:fs/promises';

/**
 * documents example function.
 */
export async function loadExample(path: string) {
  return readFile(path, 'utf-8');
}
