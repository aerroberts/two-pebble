import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureRule } from '../../structure/rule-test-harness';

describe('feature: count structure rule', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures/pass'), {
      find: 'src/**/*.ts',
      traverse: [{ find: 'export/function', rules: { count: { max: 1 } } }],
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures/fail'), {
      find: 'src/**/*.ts',
      traverse: [{ find: 'export/function', rules: { count: { max: 1 } } }],
    });

    expect(result.passed).toBe(false);
  });
});
