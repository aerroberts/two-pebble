import { InvalidGuardrailConfigError } from '../errors';
import type { CodeRule, GuardrailConfig, StructureRule } from '../types';

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
  validateFind(rule, field);
  validateOptionalRecommendation(rule.recommendation, field);
  validateOptionalAsserts(rule.asserts, field);

  if (rule.code === undefined) {
    return;
  }
  if (!Array.isArray(rule.code)) {
    throw new InvalidGuardrailConfigError(`${field}.code must be an array.`);
  }
  for (const [index, codeRule] of rule.code.entries()) {
    validateCodeRule(codeRule, `${field}.code[${index}]`);
  }
}

function validateCodeRule(rule: CodeRule, field: string) {
  validateFind(rule, field);
  validateOptionalAsserts(rule.asserts, field);
  validateOptionalRecommendation(rule.recommendation, field);
}

function validateFind(rule: { find: unknown }, field: string) {
  if (rule === null || typeof rule !== 'object') {
    throw new InvalidGuardrailConfigError(`${field} must be an object.`);
  }
  if (typeof rule.find !== 'string' && !isStringArray(rule.find)) {
    throw new InvalidGuardrailConfigError(`${field}.find must be a string or array of strings.`);
  }
}

function validateOptionalRecommendation(value: unknown, field: string) {
  if (value === undefined) {
    return;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidGuardrailConfigError(`${field}.recommendation must be a non-empty string when provided.`);
  }
}

function validateOptionalAsserts(asserts: unknown, field: string) {
  if (asserts === undefined) {
    return;
  }
  if (asserts === null || typeof asserts !== 'object' || Array.isArray(asserts)) {
    throw new InvalidGuardrailConfigError(`${field}.asserts must be an object when provided.`);
  }
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.length > 0);
}
