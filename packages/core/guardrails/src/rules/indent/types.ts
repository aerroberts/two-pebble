import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface SourceFileInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type IndentFileType = 'typescriptFile' | 'reactFile';

export interface IndentPolicy {
  maxIndentLevel?: number;
  spacesPerIndentLevel?: number;
}

export interface IndentRuleOptions {
  files?: Partial<Record<IndentFileType, IndentPolicy>>;
}
