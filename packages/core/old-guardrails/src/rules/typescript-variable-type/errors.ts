import type { DiagnosticMap } from '../../types';

export const typescriptVariableTypeErrors: DiagnosticMap = {
  'complex-variable-type': {
    description:
      'Variable declarations must use simple named types unless allowComplexVariableTypes is true. Complex inline annotations make local code carry too much type design.',
    recommendation:
      'Move the type shape into a named type before using it on a const, let, or class field. Keep implementation code focused on behavior, not type construction.',
  },
};
