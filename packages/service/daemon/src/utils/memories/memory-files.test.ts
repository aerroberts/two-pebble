import { describe, expect, test } from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { listMemoryFileEntries, listMemoryFiles, readMemoryFile, seedIndex, writeMemoryFile } from './memory-files';
import { normalizeMemoryPath, resolveMemoryFilePath } from './memory-paths';

async function makeRoot(): Promise<string> {
  const root = path.join(os.tmpdir(), `memories-test-${crypto.randomUUID()}`);
  await fs.mkdir(root, { recursive: true });
  return root;
}

describe('resolveMemoryFilePath', () => {
  test('happy: normalizes an absolute memory folder path', () => {
    expect(normalizeMemoryPath('/root/memories/project')).toBe('/root/memories/project');
  });

  test('sad: rejects relative memory folder paths', () => {
    expect(() => normalizeMemoryPath('memories/project')).toThrow(/absolute/);
  });

  test('sad: rejects memory folder paths with traversal segments', () => {
    expect(() => normalizeMemoryPath('/root/../memories/project')).toThrow(/\.\./);
  });

  test('happy: resolves a relative path inside the folder', () => {
    expect(resolveMemoryFilePath('/root/mem', 'notes/a.md')).toBe('/root/mem/notes/a.md');
  });

  test('sad: rejects paths that escape via ..', () => {
    expect(() => resolveMemoryFilePath('/root/mem', '../escape.md')).toThrow(/escapes/);
  });

  test('sad: rejects absolute paths that escape the folder', () => {
    expect(() => resolveMemoryFilePath('/root/mem', '/etc/passwd')).toThrow(/escapes/);
  });
});

describe('memory file operations', () => {
  test('happy: seedIndex writes index.md and listMemoryFiles finds it', async () => {
    const root = await makeRoot();
    await seedIndex(root, 'My Collection');
    const files = await listMemoryFiles(root);
    expect(files).toEqual(['index.md']);
    const index = await readMemoryFile(root, 'index.md');
    expect(index).toContain('# My Collection');
    await fs.rm(root, { force: true, recursive: true });
  });

  test('happy: write then list returns nested files sorted with posix separators', async () => {
    const root = await makeRoot();
    await writeMemoryFile(root, 'sub/dir/note.md', 'hello');
    await writeMemoryFile(root, 'top.md', 'top');
    const files = await listMemoryFiles(root);
    expect(files).toEqual(['sub/dir/note.md', 'top.md']);
    expect(await readMemoryFile(root, 'sub/dir/note.md')).toBe('hello');
    await fs.rm(root, { force: true, recursive: true });
  });

  test('happy: listMemoryFileEntries returns recursive file metadata', async () => {
    const root = await makeRoot();
    await writeMemoryFile(root, 'notes/a.md', 'hello');
    await writeMemoryFile(root, 'b.md', 'top');
    const entries = await listMemoryFileEntries(root);
    expect(entries.map((entry) => entry.path)).toEqual(['b.md', 'notes/a.md']);
    expect(entries[0]?.sizeBytes).toBe(3);
    expect(entries[0]?.updatedAt).toBeGreaterThan(0);
    await fs.rm(root, { force: true, recursive: true });
  });

  test('sad: write rejects an escaping path', async () => {
    const root = await makeRoot();
    await expect(writeMemoryFile(root, '../escape.md', 'x')).rejects.toThrow(/escapes/);
    await fs.rm(root, { force: true, recursive: true });
  });
});
