import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TestRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export interface TestConstOrderRuleOptions {
  allowConstAfterDescribe?: boolean;
}
