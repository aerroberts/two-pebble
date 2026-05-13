import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface ReactRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export interface ReactExportedComponentRuleOptions {
  maxExportedFunctions?: number;
  enforceFileNameMatch?: boolean;
}

export type ReactExportedComponentErrorId = 'multiple-exported-functions' | 'component-file-name';
