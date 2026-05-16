/**
 * Raised when a code.guard file does not match the structure-only schema.
 */
export class InvalidGuardrailConfigError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidGuardrailConfigError';
  }
}
