/**
 * Thrown when a caller tries to add a task or pool whose id is already in use.
 * Holds the offending id so observers can render a precise message.
 * IDs are required to be unique across both kinds within a board.
 */
export class DuplicateIdError extends Error {
  public readonly id: string;

  /**
   * Builds a DuplicateIdError annotated with the conflicting id.
   * The id is preserved for telemetry and structured logging.
   * The message follows the form `id "<id>" is already in use`.
   */
  public constructor(id: string) {
    super(`id "${id}" is already in use`);
    this.id = id;
    this.name = 'DuplicateIdError';
  }
}
