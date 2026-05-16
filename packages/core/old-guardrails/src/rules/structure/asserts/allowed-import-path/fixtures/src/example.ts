import { readFile } from 'node:fs/promises';

export { localValue } from './local';

export async function loadExample(path: string) {
  return readFile(path, 'utf-8');
}
