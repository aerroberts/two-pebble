import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TestRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export interface TestDescribeStructureRuleOptions {
  describeNamePrefix?: string;
  allowNestedDescribe?: boolean;
}

export type TestDescribeStructureErrorId = 'describe-name' | 'nested-describe';
