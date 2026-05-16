export interface GuardrailConfig {
  definition?: string;
  inherit?: string;
  structure?: StructureRule[];
}

export interface StructureRule {
  find: string | string[];
  recommendation: string;
  asserts: AssertConfig;
}

export interface AssertConfig {
  exists?: boolean;
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
