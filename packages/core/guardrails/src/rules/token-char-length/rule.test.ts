import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureRule } from '../../structure/rule-test-harness';

describe('feature: tokenCharLength structure rule', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      rules: { tokenCharLength: { min: 20, max: 160 } },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      rules: { tokenCharLength: { max: 5 } },
    });

    expect(result.passed).toBe(false);
  });
});
