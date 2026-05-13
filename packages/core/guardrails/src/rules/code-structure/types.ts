import type { RuleConfig } from '../../types';

export type CodeStructureExistence = 'must-exist' | 'must-not-exist' | 'may-exist';
export type CodeStructurePathType = 'must-be-dir' | 'must-be-file';
export type CodeStructureErrorId =
  | 'missing-path'
  | 'forbidden-path'
  | 'wrong-path-type'
  | 'wrong-file-name'
  | 'missing-content'
  | 'forbidden-content'
  | 'missing-exhaustive-content'
  | 'forbidden-import';

export type CodeStructureExtractConfig = Record<string, string>;

export interface CodeStructureConfig extends RuleConfig {
  rules?: CodeStructureRuleConfig[];
}

export type CodeStructureModuleKind = 'single-exported-function-module';

export interface CodeStructureWhereConfig {
  fileNameMatchesParentDirectory?: boolean;
  moduleKind?: CodeStructureModuleKind;
}

export interface CodeStructureRuleConfig {
  allowedImports?: string[];
  match: string;
  existence?: CodeStructureExistence;
  fileNameEndsWith?: string;
  type?: CodeStructurePathType;
  contains?: string[];
  excludes?: string[];
  exhaustiveContains?: string[];
  exhaustivelyContains?: string[];
  extract?: CodeStructureExtractConfig;
  recommendation: string;
  rules?: CodeStructureRuleConfig[];
  where?: CodeStructureWhereConfig;
}

export interface CodeStructurePointerInput {
  directory: string;
  path?: string;
  values?: Record<string, string>;
}

export interface CodeStructureExtractedValue {
  name: string;
  value: string;
}
