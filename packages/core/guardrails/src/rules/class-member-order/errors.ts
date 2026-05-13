import type { DiagnosticMap } from '../../types';

export const classMemberOrderErrors: DiagnosticMap = {
  'class-member-order': {
    description:
      'Class members must follow the configured memberOrder and maxConstructors values. Readers should see state, construction, derived views, and behavior in a predictable order.',
    recommendation:
      'Move class members into the configured order. Do not use ordering as a storytelling device; make every class scan the same way.',
  },
};
