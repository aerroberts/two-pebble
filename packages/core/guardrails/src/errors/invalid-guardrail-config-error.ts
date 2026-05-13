/**
 * Reports that guardrail configuration is invalid.
 * Config errors are raised before any rule execution begins.
 */
export class InvalidGuardrailConfigError extends Error {
  public constructor(message: string) {
    super(`Invalid guardrail config: ${message}`);
  }
}
