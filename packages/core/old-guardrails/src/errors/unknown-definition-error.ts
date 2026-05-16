/**
 * Reports that a config referenced an unknown guard definition.
 * Definitions are root-level *.guard files with a matching definition field.
 */
export class UnknownDefinitionError extends Error {
  public constructor(definition: string) {
    super(`Unknown guardrail definition: ${definition}`);
  }
}
