import { describe, expect, test } from 'bun:test';
import { controllerTestEnv } from './controller.test-env.builder';

describe('feature: guardrail definition inheritance', () => {
  test('happy: resolves inherited rules from a root guard definition file', async () => {
    const result = await controllerTestEnv().runInheritedDefinition();

    expect(result.passed).toBe(false);
    expect(result.results.map((entry) => entry.rule)).toEqual(['typescript-type-safety']);
    expect(result.results.flatMap((entry) => entry.diagnostics).map((diagnostic) => diagnostic.error)).toContain(
      'type-escape-hatch',
    );
  });

  test('unhappy: rejects unknown root guard definitions', async () => {
    await expect(controllerTestEnv().runMissingDefinition()).rejects.toThrowError(
      'Unknown guardrail definition: @group/missing',
    );
  });

  test('happy: appends local structure rules to inherited structure rules', async () => {
    const result = await controllerTestEnv().runMergedStructureDefinitions();
    const diagnostics = result.results.flatMap((entry) => entry.diagnostics);

    expect(result.results.map((entry) => entry.rule)).toEqual(['structure']);
    expect(diagnostics.map((diagnostic) => diagnostic.error)).toEqual([
      'structure-assertion-failed',
      'structure-assertion-failed',
    ]);
  });
});
