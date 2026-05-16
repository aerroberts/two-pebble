import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureRule } from '../../structure/rule-test-harness';

describe('feature: type structure rule', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts',
      rules: { type: 'file' },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts',
      rules: { type: 'folder' },
    });

    expect(result.passed).toBe(false);
  });
});
