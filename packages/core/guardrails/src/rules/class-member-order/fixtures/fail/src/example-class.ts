/**
 * Owns the bad order fixture.
 * Keeps documentation valid.
 */
export class ExampleClass {
  /**
   * Reads the fixture name.
   * Callers receive a stable string.
   */
  public readName() {
    return this.name;
  }

  private readonly name = 'bad';
}
