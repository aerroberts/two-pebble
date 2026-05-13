import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface ClassRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export interface ClassStaticMemberRuleOptions {
  allowStaticMembers?: boolean;
}
