/**
 * Thrown when a dependency would link two entities that are not siblings.
 * Dependencies must connect entities that share the same parent pool (or both
 * live at board root); this error surfaces violations of that rule.
 */
export class SiblingViolationError extends Error {
  public readonly fromId: string;
  public readonly toId: string;

  /**
   * Builds a SiblingViolationError annotated with both endpoint ids.
   * Endpoint ids are preserved for telemetry and structured logging.
   * The message names both ids so callers can identify the offending pair.
   */
  public constructor(fromId: string, toId: string) {
    super(`dependency "${fromId}" -> "${toId}" crosses pool levels; only siblings may depend on each other`);
    this.fromId = fromId;
    this.toId = toId;
    this.name = 'SiblingViolationError';
  }
}
