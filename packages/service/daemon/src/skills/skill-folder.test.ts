import { describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { listSkillFiles, readSkillFile } from './skill-files';
import { listSkillFolder, MAX_ENTRIES, type SkillFolderFs, validateSkillFolder } from './skill-folder';

function fakeFs(options: { isDirectory?: boolean; exists?: boolean; entries?: string[] }): SkillFolderFs {
  return {
    statSync() {
      if (options.exists === false) {
        throw new Error('ENOENT');
      }
      return { isDirectory: () => options.isDirectory ?? true };
    },
    readdirSync() {
      return (options.entries ?? []).map((name) => ({ name }));
    },
  };
}

describe('feature: validateSkillFolder', () => {
  test('happy: returns the normalized path for an existing directory', () => {
    const result = validateSkillFolder('/Users/x/skills/log-access', fakeFs({ isDirectory: true }));
    expect(result).toBe('/Users/x/skills/log-access');
  });

  test('sad: rejects relative paths', () => {
    expect(() => validateSkillFolder('skills/log-access', fakeFs({}))).toThrow(/absolute/);
  });

  test('sad: rejects path-escape traversal segments', () => {
    expect(() => validateSkillFolder('/Users/x/../../etc', fakeFs({}))).toThrow(/\.\./);
  });

  test('sad: rejects a missing folder', () => {
    expect(() => validateSkillFolder('/Users/x/missing', fakeFs({ exists: false }))).toThrow(/does not exist/);
  });

  test('sad: rejects a non-directory', () => {
    expect(() => validateSkillFolder('/Users/x/file.txt', fakeFs({ isDirectory: false }))).toThrow(/not a directory/);
  });
});

describe('feature: listSkillFolder', () => {
  test('happy: returns sorted top-level names', () => {
    const result = listSkillFolder('/Users/x/skills/log-access', fakeFs({ entries: ['run.sh', 'README.md'] }));
    expect(result).toEqual(['README.md', 'run.sh']);
  });

  test('filters: skips dot-entries, node_modules, and separator smuggling', () => {
    const result = listSkillFolder(
      '/Users/x/skills/log-access',
      fakeFs({ entries: ['.git', 'node_modules', 'a/b', '..', 'keep.sh'] }),
    );
    expect(result).toEqual(['keep.sh']);
  });

  test('cap: never returns more than MAX_ENTRIES', () => {
    const entries = Array.from(
      { length: MAX_ENTRIES + 50 },
      (_, index) => `file-${String(index).padStart(4, '0')}.txt`,
    );
    const result = listSkillFolder('/Users/x/skills/big', fakeFs({ entries }));
    expect(result).toHaveLength(MAX_ENTRIES);
  });
});

describe('feature: skill file browsing', () => {
  test('happy: lists and reads files relative to the skill folder', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'two-pebble-skill-'));
    try {
      await mkdir(path.join(root, 'docs'));
      await mkdir(path.join(root, '.git'));
      await mkdir(path.join(root, 'node_modules'));
      await writeFile(path.join(root, 'index.md'), '# Skill');
      await writeFile(path.join(root, 'docs', 'usage.md'), 'Use it well.');
      await writeFile(path.join(root, '.git', 'config'), 'hidden');
      await writeFile(path.join(root, 'node_modules', 'pkg.js'), 'hidden');

      await expect(listSkillFiles(root)).resolves.toEqual(['docs/usage.md', 'index.md']);
      await expect(readSkillFile(root, 'docs/usage.md')).resolves.toBe('Use it well.');
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  test('sad: rejects file reads that escape the skill folder', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'two-pebble-skill-'));
    try {
      await expect(readSkillFile(root, '../escape.md')).rejects.toThrow(/escapes/);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
