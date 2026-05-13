import type { DiagnosticMap } from '../../types';

export const definitionLengthErrors: DiagnosticMap = {
  'definition-too-long': {
    description: 'A matched definition or control-flow block is longer than the configured maxLines value.',
    recommendation:
      'Extract named helpers, split decisions into smaller branches, or move secondary behavior into a collaborator so the matched block stays reviewable.',
  },
};
