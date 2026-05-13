/**
 * Thrown when a caller references an id that the board does not know about.
 * Holds the missing id so observers can render a precise message.
 * Used by every method that takes an id as a positional argument.
 */
export class NotFoundError extends Error {
  public readonly id: string;

  /**
   * Builds a NotFoundError annotated with the missing id.
   * The id is preserved for telemetry and structured logging.
   * The message follows the form `id "<id>" not found`.
   */
  public constructor(id: string) {
    super(`id "${id}" not found`);
    this.id = id;
    this.name = 'NotFoundError';
  }
}
