/**
 * Owns the passing definition length fixture.
 * Keeps every block intentionally small.
 */
export class ExampleClass {
  /**
   * Reads the fixture name.
   * Callers receive a stable string.
   */
  public readName(name: string) {
    return readName(name);
  }
}

export function readName(name: string) {
  if (name.length > 0) return name;
  try {
    return 'example';
  } catch {
    return name;
  }
}
