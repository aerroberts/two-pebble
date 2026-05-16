import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface ClassRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type ClassFileNameCase = 'kebab-case' | 'pascal-case';

export interface ClassNameRuleOptions {
  classNamePattern?: string;
  fileNameCase?: ClassFileNameCase;
}

export type ClassNameErrorId = 'class-name' | 'class-file-name';
