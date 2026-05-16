import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TypescriptRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export interface TypescriptVariableTypeRuleOptions {
  maxSimpleUnionMembers?: number;
  allowComplexVariableTypes?: boolean;
}
