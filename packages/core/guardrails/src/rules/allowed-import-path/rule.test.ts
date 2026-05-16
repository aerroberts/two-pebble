import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { runStructureRule } from '../../structure/rule-test-harness';

describe('feature: allowedImportPath structure rule', () => {
  test('happy: passes configured assertion', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: ['src/example.ts/import', 'src/example.ts/re-export'],
      rules: { allowedImportPath: ['node:fs', './local'] },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports configured assertion failure', async () => {
    const result = await runStructureRule(resolve(import.meta.dirname, 'fixtures'), {
      find: ['src/example.ts/import', 'src/example.ts/re-export'],
      rules: { allowedImportPath: ['./local'] },
    });

    expect(result.passed).toBe(false);
  });
});
