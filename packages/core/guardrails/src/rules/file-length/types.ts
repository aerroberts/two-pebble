import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface SourceFileInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type FileLengthFileType = 'classFile' | 'typescriptFile' | 'reactFile';

export interface FileLengthPolicy {
  maxLines?: number;
}

export interface FileLengthRuleOptions {
  files?: Partial<Record<FileLengthFileType, FileLengthPolicy>>;
}

export type FileLengthErrorId = 'file-too-long';
