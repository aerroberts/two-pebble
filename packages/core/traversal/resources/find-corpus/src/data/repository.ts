import { readFile } from 'node:fs/promises';

export const repositoryKind = 'file';

export interface RepositoryOptions {
  path: string;
}

export function readRepository(options: RepositoryOptions) {
  return readFile(options.path, 'utf-8');
}

export function normalizeRepositoryName(value: string) {
  if (!value.trim()) {
    return 'default';
  }

  try {
    return value.trim().toLowerCase();
  } catch {
    return 'default';
  }
}
