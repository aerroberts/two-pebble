/**
 * Reports incorrect framework usage during execution.
 * Rule authors receive this when guardrail APIs are misused.
 */
export class InvalidGuardrailUsageError extends Error {
  public constructor(message: string) {
    super(`Invalid guardrail usage: ${message}`);
  }
}
