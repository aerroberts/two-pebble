import { readFile } from 'node:fs/promises';

export const mode = 'strict';

export interface LoadOptions {
  path: string;
}

export function loadText(options: LoadOptions) {
  return readFile(options.path, 'utf-8');
}
