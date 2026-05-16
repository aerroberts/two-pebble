import { InvalidGuardrailConfigError } from '../errors';
import type { ExcludeEntry, GuardrailConfig, StructureFindRuleConfig } from '../types';

type ConfigPrimitive = boolean | null | number | string;
type ConfigValue = ConfigPrimitive | ConfigValue[] | ConfigObject | undefined;
type ConfigObjectInput = object | undefined;

interface ConfigObject {
  [key: string]: ConfigValue;
}

export function validateGuardrailConfig(config: GuardrailConfig) {
  validateGroupReference(config.definition, 'definition');
  validateGroupReference(config.inherit, 'inherit');

  if ('additional' in config) {
    throw new InvalidGuardrailConfigError('additional is not supported; put structure checks in top-level rules.');
  }

  if (config.rules !== undefined) {
    validateRules(config.rules, 'rules');
  }

  if (config.exclude === undefined) {
    return;
  }

  if (!Array.isArray(config.exclude)) {
    throw new InvalidGuardrailConfigError('exclude must be an array.');
  }

  for (const [index, entry] of config.exclude.entries()) {
    validateExcludeEntry(entry, index);
  }
}

function validateGroupReference(value: ConfigValue, field: string) {
  if (value === undefined) {
    return;
  }

  validateNonEmptyString(value, field);

  if (typeof value === 'string' && !value.startsWith('@group/')) {
    throw new InvalidGuardrailConfigError(`${field} must start with @group/.`);
  }
}

function validateRules(rules: StructureFindRuleConfig[], field: string) {
  if (!Array.isArray(rules)) {
    throw new InvalidGuardrailConfigError(`${field} must be an array.`);
  }

  for (const [index, rule] of rules.entries()) {
    if (!isObject(rule)) {
      throw new InvalidGuardrailConfigError(`${field}[${index}] must be an object.`);
    }

    if (typeof rule.find !== 'string' && !isStringArray(rule.find)) {
      throw new InvalidGuardrailConfigError(`${field}[${index}].find must be a string or array of strings.`);
    }

    if ('assert' in rule) {
      throw new InvalidGuardrailConfigError(`${field}[${index}].assert is not supported; use rules instead.`);
    }

    if (rule.traverse !== undefined) {
      validateRules(rule.traverse, `${field}[${index}].traverse`);
    }
  }
}

function validateExcludeEntry(entry: ExcludeEntry, index: number) {
  if (!isObject(entry)) {
    throw new InvalidGuardrailConfigError(`exclude[${index}] must be an object.`);
  }

  if (entry.rules !== undefined) {
    validateStringArray(entry.rules, `exclude[${index}].rules`);
  }
  validateStringArray(entry.paths, `exclude[${index}].paths`);
  validateNonEmptyString(entry.justification, `exclude[${index}].justification`);
}

function validateStringArray(value: ConfigValue, field: string) {
  if (!isStringArray(value)) {
    throw new InvalidGuardrailConfigError(`${field} must be a non-empty array of strings.`);
  }
}

function isStringArray(value: ConfigValue) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.length > 0);
}

function validateNonEmptyString(value: ConfigValue, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidGuardrailConfigError(`${field} must be a non-empty string.`);
  }
}

function isObject(value: ConfigObjectInput) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
