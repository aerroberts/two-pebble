import type { Diagnostic } from '../types';

export type DiagnosticKeyFunction = (diagnostic: Diagnostic) => string;

export type DiagnosticGroup = [string, Diagnostic[]];

export type DiagnosticGroups = Map<string, Diagnostic[]>;
