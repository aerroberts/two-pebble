import type { DiagnosticMap } from '../../types';

export const testCaseStructureErrors: DiagnosticMap = {
  'test-outside-describe': {
    description:
      'Every test must live at the configured requiredDescribeDepth. Top-level tests make the behavior area implicit and scatter context across the file.',
    recommendation:
      'Wrap tests in one describe whose name starts with the configured describe prefix. Each test should be one case under that behavior.',
  },
  'test-name': {
    description:
      'Test names must start with one of the configured allowedTestNamePrefixes. The first word should tell the reader what kind of case they are reviewing.',
    recommendation:
      'Rename the test around the case outcome. Use the configured prefixes consistently so reports are scannable.',
  },
  'test-too-long': {
    description:
      'Test callbacks must stay within the configured maxTestLines value. Long tests usually mix setup, behavior, and assertions into one noisy block.',
    recommendation:
      'Shrink the callback by separating mechanics from the case. Keep scenario data, expected values, and the assertion visible in the test file.',
  },
};
