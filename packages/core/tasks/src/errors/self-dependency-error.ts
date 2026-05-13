/**
 * Thrown when an entity tries to depend on itself.
 * Self dependencies are always meaningless and would create immediate cycles.
 * Holds the offending id so observers can render a precise message.
 */
export class SelfDependencyError extends Error {
  public readonly id: string;

  /**
   * Builds a SelfDependencyError annotated with the offending id.
   * The id is preserved for telemetry and structured logging.
   * The message follows the form `id "<id>" cannot depend on itself`.
   */
  public constructor(id: string) {
    super(`id "${id}" cannot depend on itself`);
    this.id = id;
    this.name = 'SelfDependencyError';
  }
}
