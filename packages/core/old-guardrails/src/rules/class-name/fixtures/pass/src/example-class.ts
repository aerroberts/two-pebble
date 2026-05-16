/**
 * Owns the passing class fixture.
 * Keeps class shape intentionally small.
 */
export class ExampleClass {
  private readonly name = 'example';

  /**
   * Returns the fixture name.
   * Callers observe a stable string.
   */
  public readName() {
    return this.name;
  }
}
