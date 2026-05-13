import type { DiagnosticMap } from '../../types';

export const testMockErrors: DiagnosticMap = {
  'test-mock-or-spy': {
    description:
      'Tests must not call configured bannedMockNames. Needing call interception is usually a signal that the implementation is not extensible enough to test through public behavior.',
    recommendation:
      'Add a dependency-injection boundary instead of spying on internals. Assert black-box behavior instead of private call choreography.',
  },
};
