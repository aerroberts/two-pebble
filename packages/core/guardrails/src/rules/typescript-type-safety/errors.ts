import type { DiagnosticMap } from '../../types';

export const typescriptTypeSafetyErrors: DiagnosticMap = {
  'type-escape-hatch': {
    description:
      'Type definitions must not use configured escape hatches such as any, unknown, or satisfies. These constructs punch holes in the type boundary or hide the real contract behind compiler-only validation.',
    recommendation:
      'Replace escape hatches with a named domain type, a JSON value type, or a discriminated union that describes the actual shape.',
  },
  'forbidden-global-this': {
    description:
      'TypeScript source must not use configured forbidden identifiers such as globalThis. They hide runtime dependencies behind universal namespaces.',
    recommendation:
      'Use the direct runtime global when it is truly required, or pass the dependency through a named boundary so the owning module is explicit.',
  },
};
