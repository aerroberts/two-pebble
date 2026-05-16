import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureAssertion } from '../../assert-test-harness';

describe('feature: tokenCharLength structure assertion', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureAssertion(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      assert: { tokenCharLength: { min: 20, max: 160 } },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureAssertion(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      assert: { tokenCharLength: { max: 5 } },
    });

    expect(result.passed).toBe(false);
  });
});
