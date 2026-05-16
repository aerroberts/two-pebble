import { readFile } from 'node:fs/promises';

/**
 * documents example function.
 * keeps syntax lines outside count.
 */
export async function loadExample(path: string) {
  return readFile(path, 'utf-8');
}
