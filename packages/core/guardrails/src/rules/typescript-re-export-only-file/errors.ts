import type { DiagnosticMap } from '../../types';

export const typescriptReExportOnlyFileErrors: DiagnosticMap = {
  're-export-only-file': {
    description:
      'Files outside index.ts must not exist only to re-export another file when allowReExportOnlyFiles is false.',
    recommendation:
      'Finish the migration instead of leaving a forwarding file behind: update imports to the new file, move the implementation back, or make the file own real behavior.',
  },
};
