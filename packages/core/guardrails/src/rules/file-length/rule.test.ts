import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: file-length rule', () => {
  test('happy: passes configured file length policies', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), {
      additional: { '@rule/file-length': {} },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports files over configured length', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), {
      additional: {
        '@rule/file-length': {
          files: { classFile: { maxLines: 3 }, typescriptFile: { maxLines: 3 }, reactFile: { maxLines: 3 } },
        },
      },
    });
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('file-too-long');
  });
});
