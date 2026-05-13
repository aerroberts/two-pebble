import { describe, expect, test } from 'bun:test';
import { expectedFailureSummary } from './rule.test-constants';
import {
  codeStructureFailureSummary,
  runCodeStructureFixture,
  runStorybookStructureFixture,
  storybookStructureFailureSummary,
} from './rule.test-env.builder';

describe('feature: code structure rule', () => {
  test('happy: passes when recursive structure rules are satisfied', async () => {
    const result = await runCodeStructureFixture('pass');

    expect(result.passed).toBe(true);
    expect(result.results.flatMap((entry) => entry.diagnostics)).toEqual([]);
  });

  test('unhappy: reports recursive structure failures', async () => {
    const result = await runCodeStructureFixture('fail');

    expect(codeStructureFailureSummary(result)).toEqual(expectedFailureSummary);
  });

  test('happy: selected single exported function modules require sibling stories', async () => {
    const result = await runStorybookStructureFixture('storybook-pass');

    expect(result.passed).toBe(true);
  });

  test('unhappy: selected single exported function modules report missing sibling stories', async () => {
    const result = await runStorybookStructureFixture('storybook-fail');

    expect(storybookStructureFailureSummary(result)).toEqual([
      { error: 'missing-path', file: 'src/components/button' },
    ]);
  });
});
