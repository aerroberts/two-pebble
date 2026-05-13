import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: definition-length rule', () => {
  const strictDefinitionLengthOptions = {
    additional: {
      '@rule/definition-length': {
        definitions: [
          { match: 'classMember', maxLines: 3 },
          { match: 'function', maxLines: 3 },
          { match: 'ifStatement', maxLines: 3 },
          { match: 'tryBlock', maxLines: 3 },
          { match: 'catchBlock', maxLines: 3 },
        ],
      },
    },
  };

  test('happy: passes configured definition length policies', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), {
      additional: { '@rule/definition-length': {} },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports definitions over configured length', async () => {
    const result = await new Controller().run(
      resolve(import.meta.dirname, 'fixtures/fail'),
      strictDefinitionLengthOptions,
    );
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('definition-too-long');
  });
});
