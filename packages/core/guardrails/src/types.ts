import type { TraversalFunctionKind, TraversalNode, TraversalNodeType } from '@two-pebble/traversal';
import type { Reporter } from './reporter';

export interface DiagnosticError {
  error: string;
  description: string;
  recommendation: string;
}

export interface Diagnostic extends DiagnosticError {
  file?: string;
  line?: number;
  snippet?: string;
}

export interface ExcludeEntry {
  rules?: string[];
  paths: string[];
  justification: string;
}

export interface GuardrailConfig {
  definition?: string;
  inherit?: string;
  rules?: StructureFindRuleConfig[];
  exclude?: ExcludeEntry[];
  cacheDirectory?: string;
}

export interface StructureFindRuleConfig extends StructureRuleConfig {
  find: string | string[];
}

export interface StructureRuleConfig {
  allowEmpty?: boolean;
  exclude?: string[];
  exhaustiveContains?: string[];
  exhaustivelyContains?: string[];
  extract?: Record<string, string>;
  invert?: boolean;
  recommendation?: string;
  recommendations?: string;
  recomendations?: string;
  rules?: StructureRuleAssertions;
  traverse?: StructureFindRuleConfig[];
}

export interface StructureRuleAssertions {
  allowedImportPath?: string[];
  exists?: boolean;
  type?: TraversalNodeType;
  async?: boolean;
  functionKind?: TraversalFunctionKind;
  importPath?: string | StructureStringRuleConfig;
  commentContent?: string | StructureStringRuleConfig;
  fileName?: string | StructureFileNameRuleConfig;
  matchesFileName?: boolean;
  contains?: string | string[];
  missing?: string | string[];
  lines?: StructureRangeRuleConfig;
  tokenLineLength?: StructureRangeRuleConfig;
  tokenCharLength?: StructureRangeRuleConfig;
}

export interface StructureStringRuleConfig {
  contains?: string;
  endsWith?: string;
  equals?: string;
  missing?: string;
  startsWith?: string;
}

export interface StructureFileNameRuleConfig {
  equals?: string;
  endsWith?: string;
  startsWith?: string;
}

export interface StructureRangeRuleConfig {
  min?: number;
  max?: number;
}

export interface StructureRuleFailure {
  node?: TraversalNode;
  rule: string;
  message: string;
}

export interface CheckResult {
  rule: string;
  passed: boolean;
  diagnostics: Diagnostic[];
  filesScanned: Set<string>;
  durationMs: number;
}

export interface RunResult {
  passed: boolean;
  results: CheckResult[];
  totalDurationMs: number;
}

export type FileCallback = (file: string, reporter: Reporter) => void | Promise<void>;
