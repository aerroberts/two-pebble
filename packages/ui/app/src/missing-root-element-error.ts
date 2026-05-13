/**
 * Raised when the React renderer cannot find its mount node in the document.
 */
export class MissingRootElementError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'MissingRootElementError';
  }
}
