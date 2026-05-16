import type { DiagnosticMap } from '../../types';

export const indentErrors: DiagnosticMap = {
  'excessive-indent': {
    description:
      'A file matched a configured indentation policy and contains a line indented deeper than that policy allows.',
    recommendation:
      'Extract nested branches, builders, fixtures, or JSX chunks until the code can stay within the configured indentation depth.',
  },
};
