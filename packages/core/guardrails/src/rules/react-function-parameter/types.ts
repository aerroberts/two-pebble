import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface ReactRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export interface ReactFunctionParameterRuleOptions {
  allowDestructuredFunctionParameters?: boolean;
  allowComplexSignatureTypes?: boolean;
  maxSimpleUnionMembers?: number;
}

export type ReactFunctionParameterErrorId = 'destructured-function-parameter' | 'complex-signature-type';
