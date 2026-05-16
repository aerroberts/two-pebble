import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureRule } from '../../structure/rule-test-harness';

describe('feature: async structure rule', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      rules: { async: true },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      rules: { async: false },
    });

    expect(result.passed).toBe(false);
  });
});
