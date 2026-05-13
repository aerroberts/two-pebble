import type { DiagnosticMap } from '../../types';

export const testDescribeStructureErrors: DiagnosticMap = {
  'describe-name': {
    description:
      'Describe names must start with the configured describeNamePrefix. Tests should organize around behavior, not implementation classes or incidental file names.',
    recommendation:
      'Rename the describe to a short feature phrase. The configured prefix keeps test reports scannable.',
  },
  'nested-describe': {
    description:
      'Describe blocks must not be nested when allowNestedDescribe is false. Nested suites turn tests into a control-flow tree and make setup rules harder to see.',
    recommendation: 'Keep one describe per behavior area and put each case directly inside it.',
  },
};
