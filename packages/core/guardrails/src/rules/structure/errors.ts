import type { DiagnosticError } from '../../types';
import type { StructureRuleConfig } from './types';

export function structureDiagnostic(assertion: string, message: string, rule: StructureRuleConfig): DiagnosticError {
  return {
    error: 'structure-assertion-failed',
    description: `A structure assertion failed for ${assertion}. ${message}`,
    recommendation:
      rule.recommendation ??
      rule.recommendations ??
      rule.recomendations ??
      'Update the matched structure or adjust the structure rule if the convention changed.',
  };
}
