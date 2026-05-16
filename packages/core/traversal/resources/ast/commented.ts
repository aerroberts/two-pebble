/**
 * Creates an example service used by traversal snapshots.
 */
export class ExampleService {
  public run(input: string) {
    return input;
  }
}

export interface ExampleInput {
  value: string;
}
