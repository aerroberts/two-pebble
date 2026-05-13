import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TypescriptRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type DocumentationStatementMatch = 'class' | 'publicClassMethod' | 'function' | 'interface' | 'type';

export interface DocumentationStatementRule {
  match: DocumentationStatementMatch;
  minimumJSDocLines?: number;
}

export interface DocumentationRuleOptions {
  statements?: DocumentationStatementRule[];
}

export interface DocumentationStatementCheckInput {
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
  statementRule: DocumentationStatementRule;
}
