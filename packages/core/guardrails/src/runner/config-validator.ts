import { InvalidGuardrailConfigError } from '../errors';
import type { GuardrailConfig, StructureRule } from '../types';

/**
 * Validates a parsed guard config matches the structure-only schema.
 */
export function validateGuardrailConfig(config: GuardrailConfig) {
  validateGroupReference(config.definition, 'definition');
  validateGroupReference(config.inherit, 'inherit');

  if (config.structure === undefined) {
    return;
  }

  if (!Array.isArray(config.structure)) {
    throw new InvalidGuardrailConfigError('structure must be an array.');
  }

  for (const [index, rule] of config.structure.entries()) {
    validateStructureRule(rule, `structure[${index}]`);
  }
}

function validateGroupReference(value: string | undefined, field: string) {
  if (value === undefined) {
    return;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidGuardrailConfigError(`${field} must be a non-empty string.`);
  }
  if (!value.startsWith('@group/')) {
    throw new InvalidGuardrailConfigError(`${field} must start with @group/.`);
  }
}

function validateStructureRule(rule: StructureRule, field: string) {
  if (rule === null || typeof rule !== 'object') {
    throw new InvalidGuardrailConfigError(`${field} must be an object.`);
  }
  if (typeof rule.find !== 'string' && !isStringArray(rule.find)) {
    throw new InvalidGuardrailConfigError(`${field}.find must be a string or array of strings.`);
  }
  if (typeof rule.recommendation !== 'string' || rule.recommendation.trim().length === 0) {
    throw new InvalidGuardrailConfigError(`${field}.recommendation must be a non-empty string.`);
  }
  if (rule.asserts === null || typeof rule.asserts !== 'object') {
    throw new InvalidGuardrailConfigError(`${field}.asserts must be an object.`);
  }
  if (Object.keys(rule.asserts).length === 0) {
    throw new InvalidGuardrailConfigError(`${field}.asserts must declare at least one assertion.`);
  }
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.length > 0);
}
