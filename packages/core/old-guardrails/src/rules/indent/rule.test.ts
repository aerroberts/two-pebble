import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: indent rule', () => {
  const strictIndentOptions = {
    additional: {
      '@rule/indent': {
        files: {
          typescriptFile: { maxIndentLevel: 2, spacesPerIndentLevel: 2 },
          reactFile: { maxIndentLevel: 2, spacesPerIndentLevel: 2 },
        },
      },
    },
  };

  test('happy: passes configured indentation policies', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), {
      additional: { '@rule/indent': {} },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports excessive indentation', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), strictIndentOptions);
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('excessive-indent');
  });
});
