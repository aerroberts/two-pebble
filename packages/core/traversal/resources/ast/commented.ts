/**
 * Creates an example service used by traversal snapshots.
 */
export class ExampleService {
  public static label = 'example';

  /**
   * Returns the input unchanged.
   * Keeps the method fixture small.
   */
  public run(input: string) {
    return input;
  }
}

export interface ExampleInput {
  value: string;
}
