import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TypescriptRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export interface TypescriptFunctionShapeRuleOptions {
  maxFunctionParameters?: number;
  maxSimpleUnionMembers?: number;
  allowOptionalParameters?: boolean;
  allowDefaultParameters?: boolean;
  allowComplexSignatureTypes?: boolean;
}

export type TypescriptFunctionShapeErrorId =
  | 'too-many-parameters'
  | 'optional-parameter'
  | 'default-parameter'
  | 'complex-signature-type';
