import type { DiagnosticMap } from '../../types';

export const topLevelDefinitionsErrors: DiagnosticMap = {
  'top-level-definition': {
    description:
      'A file matched a configured top-level definition policy and contains a statement kind that policy does not allow.',
    recommendation:
      'Move extra values, helpers, types, or exports into a file whose role allows them, or update the top-level definition policy for this file type.',
  },
  'nested-definition': {
    description:
      'A file matched a configured top-level definition policy and contains a nested definition kind that policy bans.',
    recommendation:
      'Move shared helpers, fakes, and support types into dedicated support modules so the file keeps one clear role.',
  },
};
