import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { Controller } from '../../runner/controller';
import { structureDiagnosticSummary } from './structure-diagnostic-summary';
import {
  excludedStructureRuleConfig,
  passingStructureRuleConfig,
  traversalPropertyStructureRuleConfig,
} from './structure-rule-test-config';

describe('feature: structure rule', () => {
  test('happy: passes filesystem and AST assertions', async () => {
    const result = await new Controller().run(
      resolve(import.meta.dirname, 'fixtures/pass'),
      passingStructureRuleConfig(),
    );

    expect(result.passed).toBe(true);
  });

  test('happy: asserts traversal metadata properties', async () => {
    const result = await new Controller().run(
      resolve(import.meta.dirname, 'fixtures/pass'),
      traversalPropertyStructureRuleConfig(),
    );

    expect(result.passed).toBe(true);
  });

  test('happy: ignores excluded traversal nodes', async () => {
    const result = await new Controller().run(
      resolve(import.meta.dirname, 'fixtures/pass'),
      excludedStructureRuleConfig(),
    );

    expect(result.passed).toBe(true);
  });

  test('unhappy: reports failed filesystem and AST assertions', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/fail');
    const result = await new Controller().run(root, passingStructureRuleConfig());
    const diagnostics = result.results.flatMap((entry) => entry.diagnostics);
    const failure = { error: 'structure-assertion-failed', file: '' };

    expect(structureDiagnosticSummary(root, diagnostics)).toEqual([
      { error: 'structure-assertion-failed', file: 'src/commented.ts' },
      ...Array(5).fill(failure),
    ]);
  });
});
