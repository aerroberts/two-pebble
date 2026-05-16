import type { DiagnosticError, StructureRuleConfig } from '../types';

export function structureDiagnostic(rule: string, message: string, config: StructureRuleConfig): DiagnosticError {
  return {
    error: 'structure-rule-failed',
    description: `A structure rule failed for ${rule}. ${message}`,
    recommendation:
      config.recommendation ??
      config.recommendations ??
      config.recomendations ??
      'Update the matched structure or adjust the structure rule if the convention changed.',
  };
}
