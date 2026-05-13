import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: test-const-order rule', () => {
  test('happy: passes focused fixture', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), {
      additional: { '@rule/test-const-order': { allowConstAfterDescribe: false } },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports focused violation', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), {
      additional: { '@rule/test-const-order': { allowConstAfterDescribe: false } },
    });
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('test-const-after-describe');
  });
});
