/**
 * Reports that a config referenced an unknown rule.
 * This keeps registry failures distinct from rule execution failures.
 */
export class UnknownRuleError extends Error {
  public constructor(ruleName: string) {
    super(`Unknown guardrail rule: ${ruleName}`);
  }
}
