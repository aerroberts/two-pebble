import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: class-member-order rule', () => {
  const memberOrderOptions = {
    additional: {
      '@rule/class-member-order': {
        memberOrder: ['fields', 'constructor', 'accessors', 'methods'],
        maxConstructors: 1,
      },
    },
  };

  test('happy: passes focused fixture', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), memberOrderOptions);

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports focused violation', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), memberOrderOptions);
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('class-member-order');
  });
});
