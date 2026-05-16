export interface GuardrailConfig {
  definition?: string;
  inherit?: string;
  structure?: StructureRule[];
}

export interface StructureRule {
  find: string | string[];
  recommendation?: string;
  asserts?: AssertConfig;
  // Per-file AST checks run independently inside every file matched by `find`.
  // Each entry's `find` is an AST query (no glob prefix); the runner scopes it
  // to one file at a time.
  code?: CodeRule[];
}

export interface CodeRule {
  find: string | string[];
  asserts?: AssertConfig;
  recommendation?: string;
}

export interface AssertConfig {
  exists?: boolean;
  type?: string;
  matches?: NumberRange;
  lines?: NumberRange;
}

export type AssertName = keyof AssertConfig;

export interface AssertOutcome {
  passed: boolean;
  description?: string;
}

export interface NumberRange {
  exactly?: number;
  min?: number;
  max?: number;
}

export interface Diagnostic {
  recommendation: string;
  description: string;
  find: string;
  assertion: string;
  file?: string;
}

export interface CheckResult {
  find: string;
  recommendation: string;
  passed: boolean;
  diagnostics: Diagnostic[];
  durationMs: number;
}

export interface RunResult {
  passed: boolean;
  results: CheckResult[];
  filesScanned: Set<string>;
  totalDurationMs: number;
}
