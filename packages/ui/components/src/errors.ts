/**
 * Base error for component-level failures.
 */
export class ComponentError extends Error {
  public readonly code: string;

  public constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ComponentError';
  }
}
