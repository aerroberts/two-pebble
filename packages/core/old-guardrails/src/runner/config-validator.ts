import { InvalidGuardrailConfigError } from '../errors';
import type { AdditionalRules, ExcludeEntry, GuardrailConfig, RuleConfig } from '../types';

type ConfigValidationPrimitive = boolean | null | number | string;
type ConfigValidationValue = ConfigValidationPrimitive | ConfigValidationValue[] | ConfigValidationObject | undefined;
type ConfigValidationObjectInput = object | undefined;

interface ConfigValidationObject {
  [key: string]: ConfigValidationValue;
}

export function validateGuardrailConfig(config: GuardrailConfig) {
  validateGroupReference(config.definition, 'definition');
  validateGroupReference(config.inherit, 'inherit');
  validateAdditionalRules(config.additional);

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

function validateGroupReference(value: ConfigValidationValue, field: string) {
  if (value === undefined) {
    return;
  }

  validateNonEmptyString(value, field);

  if (typeof value === 'string' && !value.startsWith('@group/')) {
    throw new InvalidGuardrailConfigError(`${field} must start with @group/.`);
  }
}

function validateAdditionalRules(additional: AdditionalRules) {
  if (additional === undefined) {
    return;
  }

  if (!isObject(additional)) {
    throw new InvalidGuardrailConfigError('additional must be an object.');
  }

  for (const [ruleName, ruleConfig] of Object.entries(additional)) {
    if (!isObject(ruleConfig)) {
      throw new InvalidGuardrailConfigError(`additional.${ruleName} must be an object.`);
    }

    const config = ruleConfig as RuleConfig;

    if ('options' in config) {
      throw new InvalidGuardrailConfigError(
        `additional.${ruleName}.options is not supported; put rule config fields at the top level.`,
      );
    }

    if ('paths' in config) {
      throw new InvalidGuardrailConfigError(
        `additional.${ruleName}.paths is not supported; rules own their file matching.`,
      );
    }
  }
}

function validateExcludeEntry(entry: ExcludeEntry, index: number) {
  if (!isObject(entry)) {
    throw new InvalidGuardrailConfigError(`exclude[${index}] must be an object.`);
  }

  validateStringArray(entry.rules, `exclude[${index}].rules`);
  validateStringArray(entry.paths, `exclude[${index}].paths`);
  validateJustification(entry.justification, index);
}

function validateJustification(justification: string, index: number) {
  validateNonEmptyString(justification, `exclude[${index}].justification`);
}

function validateStringArray(value: ConfigValidationValue, field: string) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidGuardrailConfigError(`${field} must be a non-empty array of strings.`);
  }

  for (const item of value) {
    validateNonEmptyString(item, field);
  }
}

function validateNonEmptyString(value: ConfigValidationValue, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidGuardrailConfigError(`${field} must be a non-empty string.`);
  }
}

function isObject(value: ConfigValidationObjectInput) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
