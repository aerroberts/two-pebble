import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';

describe('feature: test-case-structure rule', () => {
  const testCaseStructureOptions = {
    additional: {
      '@rule/test-case-structure': {
        testCallNames: ['test', 'it'],
        requiredDescribeDepth: 1,
        allowedTestNamePrefixes: ['happy: ', 'unhappy: ', 'snapshot: '],
        maxTestLines: 12,
      },
    },
  };

  test('happy: passes focused fixture', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/pass'), testCaseStructureOptions);

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports focused violation', async () => {
    const result = await new Controller().run(resolve(import.meta.dirname, 'fixtures/fail'), testCaseStructureOptions);
    const errors = result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error);

    expect(errors).toContain('test-name');
  });
});
