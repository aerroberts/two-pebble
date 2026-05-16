import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TypescriptRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type TypescriptForbiddenSyntax = 'any' | 'unknown' | 'satisfies' | 'globalThis';

export interface TypescriptTypeSafetyRuleOptions {
  forbiddenSyntax?: TypescriptForbiddenSyntax[];
}

export type TypescriptTypeSafetyErrorId = 'type-escape-hatch' | 'forbidden-global-this';
