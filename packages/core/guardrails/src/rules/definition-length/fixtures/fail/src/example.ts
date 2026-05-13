/**
 * Owns the failing definition length fixture.
 * Keeps documentation valid.
 */
export class ExampleClass {
  /**
   * Reads the fixture name.
   * Callers receive a stable string.
   */
  public readName(name: string) {
    const value = readName(name);
    return value;
  }
}

export function readName(name: string) {
  if (name.length > 0) {
    const next = name.trim();
    return next;
  }

  try {
    const fallback = 'example';
    return fallback;
  } catch {
    const fallback = name;
    return fallback;
  }
}
