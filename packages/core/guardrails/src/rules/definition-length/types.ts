import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TypescriptRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type DefinitionLengthMatch = 'classMember' | 'function' | 'ifStatement' | 'tryBlock' | 'catchBlock';

export interface DefinitionLengthPolicy {
  match: DefinitionLengthMatch;
  maxLines?: number;
}

export interface DefinitionLengthRuleOptions {
  excludeTestFiles?: boolean;
  definitions?: DefinitionLengthPolicy[];
}

export interface DefinitionLengthCheckInput {
  sourceText: string;
  node: ts.Node;
  reporter: Reporter;
  policy: DefinitionLengthPolicy;
}
