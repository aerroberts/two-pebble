import type { DiagnosticMap } from '../../types';

export const reactJsxStyleErrors: DiagnosticMap = {
  'react-classname-or-style': {
    description:
      'React application code must not use configured bannedJsxAttributes. App packages should compose the component library instead of owning raw styling decisions.',
    recommendation:
      'Move the styling concern into a reusable component, extend an existing library primitive, or import the right component for the job.',
  },
};
