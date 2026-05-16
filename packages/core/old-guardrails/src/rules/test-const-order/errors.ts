import type { DiagnosticMap } from '../../types';

export const testConstOrderErrors: DiagnosticMap = {
  'test-const-after-describe': {
    description:
      'Top-level constants must be defined before describe blocks when allowConstAfterDescribe is false. Constants after the suite make the reader jump between behavior and examples.',
    recommendation:
      'Move shared case data, expected values, and named fixtures above the describe. Tests should read top-down: imports, named examples, then the behavior suite.',
  },
};
