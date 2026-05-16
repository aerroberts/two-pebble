import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: typescript-re-export-only-file rule', () => {
  test('happy: passes files that own behavior', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), {
      additional: { '@rule/typescript-re-export-only-file': { allowReExportOnlyFiles: false } },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports non-index files that only re-export', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), {
      additional: { '@rule/typescript-re-export-only-file': { allowReExportOnlyFiles: false } },
    });
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('re-export-only-file');
  });
});
