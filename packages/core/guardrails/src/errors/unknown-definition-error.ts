/**
 * Raised when a code.guard file inherits a group that cannot be found.
 */
export class UnknownDefinitionError extends Error {
  public constructor(definition: string) {
    super(`Unknown guardrail definition ${definition}.`);
    this.name = 'UnknownDefinitionError';
  }
}
