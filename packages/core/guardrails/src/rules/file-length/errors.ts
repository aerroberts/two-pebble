import type { DiagnosticMap } from '../../types';

export const fileLengthErrors: DiagnosticMap = {
  'file-too-long': {
    description: 'A file matched a configured file length policy and has more lines than that policy allows.',
    recommendation:
      'Move secondary behavior into focused modules until the file has one clear responsibility and fits inside the configured limit.',
  },
};
