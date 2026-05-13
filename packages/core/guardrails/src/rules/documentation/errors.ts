import type { DiagnosticMap } from '../../types';

export const documentationErrors: DiagnosticMap = {
  'missing-documentation': {
    description:
      'A statement matched a configured documentation rule but does not have a multiline JSDoc block that meets the configured minimum line count.',
    recommendation:
      'Add a short JSDoc block that explains the responsibility, contract, or boundary of the matched statement.',
  },
};
