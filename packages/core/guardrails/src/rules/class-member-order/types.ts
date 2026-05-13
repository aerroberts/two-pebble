import type ts from 'typescript';
import type { Reporter } from '../../reporter';

export interface ClassRuleInput {
  file: string;
  sourceText: string;
  sourceFile: ts.SourceFile;
  reporter: Reporter;
}

export type ClassMemberPhase = 'fields' | 'constructor' | 'accessors' | 'methods';

export interface ClassMemberOrderRuleOptions {
  memberOrder?: ClassMemberPhase[];
  maxConstructors?: number;
}
