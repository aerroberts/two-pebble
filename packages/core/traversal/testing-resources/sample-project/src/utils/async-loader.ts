import { readFile } from 'node:fs/promises';

export async function loadJson(path: string) {
  const text = await readFile(path, 'utf-8');
  return JSON.parse(text);
}
