import { InvalidGuardrailConfigError } from '../errors';
import { ASSERT_NAMES } from '../run-asserts';
import type { CodeRule, GuardrailConfig, StructureRule } from '../types';

const TOP_LEVEL_KEYS = new Set(['definition', 'inherit', 'structure']);
const STRUCTURE_RULE_KEYS = new Set(['find', 'exclude', 'recommendation', 'asserts', 'code']);
const CODE_RULE_KEYS = new Set(['find', 'exclude', 'recommendation', 'asserts']);
const KNOWN_ASSERTS = new Set<string>(ASSERT_NAMES);

/**
 * Validates a parsed guard config matches the structure-only schema. Rejects
 * unknown top-level fields and unknown rule fields so misspellings like
 * `assert` (instead of `asserts`) surface as errors rather than silent no-ops.
 */
export function validateGuardrailConfig(config: GuardrailConfig) {
  validateKnownKeys(config, TOP_LEVEL_KEYS, 'config', 'known fields');
  validateGroupReference(config.definition, 'definition');
  validateInherit(config.inherit);

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

function validateGroupReference(value: unknown, field: string) {
  if (value === undefined) {
    return;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidGuardrailConfigError(`${field} must be a non-empty string.`);
  }
}

function validateInherit(value: unknown) {
  if (value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    validateGroupReference(value, 'inherit');
    return;
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidGuardrailConfigError('inherit must be a non-empty string or array of strings.');
  }
  for (const [index, entry] of value.entries()) {
    validateGroupReference(entry, `inherit[${index}]`);
  }
}

function validateStructureRule(rule: StructureRule, field: string) {
  validateKnownKeys(rule, STRUCTURE_RULE_KEYS, field, 'structure rule fields');
  validateFind(rule, field);
  validateOptionalExclude(rule.exclude, field);
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
  validateKnownKeys(rule, CODE_RULE_KEYS, field, 'code rule fields');
  validateFind(rule, field);
  validateOptionalExclude(rule.exclude, field);
  validateOptionalAsserts(rule.asserts, field);
  validateOptionalRecommendation(rule.recommendation, field);
}

function validateKnownKeys(value: unknown, allowed: Set<string>, field: string, label: string) {
  if (value === null || typeof value !== 'object') {
    return;
  }
  for (const key of Object.keys(value as object)) {
    if (!allowed.has(key)) {
      throw new InvalidGuardrailConfigError(
        `${field} has unknown key "${key}". Allowed ${label}: ${[...allowed].join(', ')}.`,
      );
    }
  }
}

function validateOptionalExclude(value: unknown, field: string) {
  if (value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    if (value.length === 0) {
      throw new InvalidGuardrailConfigError(`${field}.exclude must be a non-empty string when provided.`);
    }
    return;
  }
  if (!isStringArray(value)) {
    throw new InvalidGuardrailConfigError(`${field}.exclude must be a string or array of strings.`);
  }
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
  for (const key of Object.keys(asserts)) {
    if (!KNOWN_ASSERTS.has(key)) {
      throw new InvalidGuardrailConfigError(
        `${field}.asserts has unknown assertion "${key}". Known assertions: ${[...KNOWN_ASSERTS].join(', ')}.`,
      );
    }
  }
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.length > 0);
}
