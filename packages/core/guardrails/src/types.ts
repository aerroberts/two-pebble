import type ts from 'typescript';
import type { Reporter } from './reporter';

export interface DiagnosticError {
  error: string;
  description: string;
  recommendation: string;
}

export type DiagnosticMap = Record<string, Omit<DiagnosticError, 'error'>>;

export interface Diagnostic extends DiagnosticError {
  file?: string;
  line?: number;
  snippet?: string;
}

export type RuleOptions = object;

export interface GuardrailContext<TOptions = RuleOptions> {
  packageDir: string;
  exclude: string[];
  options: TOptions;
}

export interface ExcludeEntry {
  rules: string[];
  paths: string[];
  justification: string;
}

export type ExcludeList = ExcludeEntry[];

export interface GuardrailConfig {
  definition?: string;
  inherit?: string;
  additional?: Record<string, RuleConfig>;
  exclude?: ExcludeEntry[];
}

export type RuleConfig<TOptions = RuleOptions> = TOptions;
export type AdditionalRules = Record<string, RuleConfig> | undefined;

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

export interface TypescriptFileInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type TypescriptFileCallback = (input: TypescriptFileInput) => void | Promise<void>;
