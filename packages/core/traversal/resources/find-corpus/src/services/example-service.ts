/**
 * Coordinates example service work.
 */
export class ExampleService {
  public constructor() {}

  public static create() {
    return new ExampleService();
  }

  /**
   * Runs the example service.
   * Normalizes caller input.
   */
  public run(input: string) {
    return this.normalize(input.trim());
  }

  private normalize(input: string) {
    return input.toLowerCase();
  }
}

export interface ExampleServiceInput {
  value: string;
}
