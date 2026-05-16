import { readFile } from 'node:fs/promises';

export const repositoryKind = 'file';

export interface RepositoryOptions {
  path: string;
}

export function readRepository(options: RepositoryOptions) {
  return readFile(options.path, 'utf-8');
}
