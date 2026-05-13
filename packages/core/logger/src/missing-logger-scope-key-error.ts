/**
 * Thrown when code requires a logger scope value that is not active.
 *
 * Required scope keys are useful at integration boundaries where continuing
 * without correlation data would hide the operation that produced a log.
 */
export class MissingLoggerScopeKeyError extends Error {
  public readonly key: string;

  /**
   * Creates an error for the missing scope key.
   *
   * The key is stored separately from the message so callers can assert on the
   * exact missing value without parsing user-facing text.
   */
  public constructor(key: string) {
    super(`Missing logger scope key: ${key}`);
    this.name = 'MissingLoggerScopeKeyError';
    this.key = key;
  }
}
