import type { DiagnosticMap } from '../../types';

export const testHookErrors: DiagnosticMap = {
  'test-hook': {
    description:
      'Tests must not call configured bannedHookNames. Hooks hide setup and cleanup away from the case that depends on them.',
    recommendation:
      'Create setup inline in the test so the context is visible at the call site. Use a builder only for expensive or repetitive mechanics.',
  },
};
