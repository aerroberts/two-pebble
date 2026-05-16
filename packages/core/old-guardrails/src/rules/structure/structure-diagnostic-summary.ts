import { relative } from 'node:path';
import type { Diagnostic } from '../../types';

export function structureDiagnosticSummary(root: string, diagnostics: Diagnostic[]) {
  return diagnostics.map((diagnostic) => ({
    error: diagnostic.error,
    file: diagnostic.file ? relative(root, diagnostic.file).replaceAll('\\', '/') : undefined,
  }));
}
