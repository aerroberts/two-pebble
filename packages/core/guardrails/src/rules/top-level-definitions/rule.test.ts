import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: top-level-definitions rule', () => {
  test('happy: passes configured file role policies', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), {
      additional: { '@rule/top-level-definitions': {} },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports disallowed top-level and nested definitions', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), {
      additional: { '@rule/top-level-definitions': {} },
    });
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('top-level-definition');
    expect(errors).toContain('nested-definition');
  });
});
