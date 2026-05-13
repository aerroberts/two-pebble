import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface TypescriptRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type TopLevelDefinitionFileType = 'classFile' | 'testFile' | 'indexFile' | 'typesFile';

export type TopLevelStatementKind =
  | 'class'
  | 'const'
  | 'describe'
  | 'enum'
  | 'export'
  | 'function'
  | 'import'
  | 'interface'
  | 'type';

export interface TopLevelDefinitionPolicy {
  allowedTopLevelStatements?: TopLevelStatementKind[];
  bannedNestedDefinitions?: TopLevelStatementKind[];
}

export interface TopLevelDefinitionsRuleOptions {
  files?: Partial<Record<TopLevelDefinitionFileType, TopLevelDefinitionPolicy>>;
}

export type TopLevelDefinitionsErrorId = 'top-level-definition' | 'nested-definition';
