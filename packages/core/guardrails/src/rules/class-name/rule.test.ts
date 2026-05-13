import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: class-name rule', () => {
  test('happy: passes focused fixture', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), {
      additional: { '@rule/class-name': { classNamePattern: '^[A-Z][A-Za-z0-9]*$', fileNameCase: 'kebab-case' } },
    });

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports focused violation', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), {
      additional: { '@rule/class-name': { classNamePattern: '^[A-Z][A-Za-z0-9]*$', fileNameCase: 'kebab-case' } },
    });
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('class-name');
  });
});
