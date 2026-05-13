import { describe, expect, test } from 'bun:test';
import type { GuardrailConfig } from '../types';
import { validateGuardrailConfig } from './config-validator';
import { missingJustificationError } from './config-validator.test-constants';
import { configValidatorTestEnv } from './config-validator.test-env.builder';

describe('feature: guardrail config validation', () => {
  test('happy: accepts exclusion entries with string justification', () => {
    const validExcludeConfig = {
      exclude: [
        {
          rules: ['no-process-env'],
          paths: ['src/**'],
          justification: 'Package boundary reads environment variables.',
        },
      ],
    };
    expect(() => validateGuardrailConfig(validExcludeConfig)).not.toThrow();
  });

  test('unhappy: rejects exclusions without justification', () => {
    const config = { exclude: [{ rules: ['no-process-env'], paths: ['src/**'] }] } as GuardrailConfig;
    expect(() => validateGuardrailConfig(config)).toThrowError(missingJustificationError);
  });

  test('unhappy: rejects incomplete justifications', () => {
    const config = {
      exclude: [{ rules: ['no-process-env'], paths: ['src/**'], justification: '' }],
    } as GuardrailConfig;
    expect(() => validateGuardrailConfig(config)).toThrowError(missingJustificationError);
  });

  test('unhappy: rejects invalid exclusion config before execution', async () => {
    const config = { exclude: [{ rules: ['*'], paths: ['src/**'] }] } as GuardrailConfig;
    await expect(configValidatorTestEnv().run(config)).rejects.toThrowError(missingJustificationError);
  });

  test('unhappy: rejects definition names without the group prefix', () => {
    const config = { definition: 'guardrails-typescript' } as GuardrailConfig;
    expect(() => validateGuardrailConfig(config)).toThrowError(
      'Invalid guardrail config: definition must start with @group/.',
    );
  });

  test('unhappy: rejects inherit names without the group prefix', () => {
    const config = { inherit: 'guardrails-typescript' } as GuardrailConfig;
    expect(() => validateGuardrailConfig(config)).toThrowError(
      'Invalid guardrail config: inherit must start with @group/.',
    );
  });
});
