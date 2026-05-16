import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureAssertion } from '../../assert-test-harness';

describe('feature: allowedImportPath structure assertion', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureAssertion(resolve(import.meta.dirname, 'fixtures'), {
      find: ['src/example.ts/import', 'src/example.ts/re-export'],
      assert: { allowedImportPath: ['node:fs', './local'] },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureAssertion(resolve(import.meta.dirname, 'fixtures'), {
      find: ['src/example.ts/import', 'src/example.ts/re-export'],
      assert: { allowedImportPath: ['./local'] },
    });

    expect(result.passed).toBe(false);
  });
});
