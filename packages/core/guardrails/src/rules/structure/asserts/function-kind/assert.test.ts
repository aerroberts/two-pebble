import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureAssertion } from '../../assert-test-harness';

describe('feature: functionKind structure assertion', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureAssertion(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      assert: { functionKind: 'declaration' },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureAssertion(resolve(import.meta.dirname, 'fixtures'), {
      find: 'src/example.ts/export/function',
      assert: { functionKind: 'arrow' },
    });

    expect(result.passed).toBe(false);
  });
});
