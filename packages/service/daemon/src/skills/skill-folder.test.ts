import { describe, expect, test } from 'bun:test';
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
